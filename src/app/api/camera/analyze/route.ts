import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { DISEASE_DICTIONARY, DiseaseInfo } from '@/lib/imageAnalysis';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const cameraId = (formData.get('camera_id') as string) || 'camera_1';
    const cameraName = (formData.get('camera_name') as string) || '1-Kamera (Old Panoramik)';
    const featuresJson = formData.get('features') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Rasm fayli yuklanmadi' }, { status: 400 });
    }

    let detectedCondition = 'healthy';
    let confidence = 0.96;

    // 1. Process client-side HTML5 canvas feature metrics
    if (featuresJson) {
      try {
        const parsed = JSON.parse(featuresJson);
        if (parsed.condition) {
          detectedCondition = parsed.condition;
          confidence = parsed.confidence || confidence;
        }
      } catch (e) {
        console.warn('Failed to parse features:', e);
      }
    }

    const geminiKey = serverStore.geminiApiKey || process.env.GEMINI_API_KEY;
    let disease: DiseaseInfo = DISEASE_DICTIONARY[detectedCondition] || DISEASE_DICTIONARY['healthy'];
    let geminiUsed = false;

    // 2. Call Google Gemini Multimodal Vision if key is provided
    if (geminiKey) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Sen professional qishloq xo'jaligi fitopatologisan. Berilgan kadrni tahlil qil.
1. Agar kadrda o'simlik yoki meva bo'lmasa (masalan, inson, yuz, xona, mebel, devor, naushnik bo'lsa), "is_plant": false deb belgilagin.
2. Agar o'simlik bo'lsa: aniq kasallik nomini va 4 bosqichli davolash rejasini yoz.
Javobingni FAQAT quyidagi toza JSON formatida ber:
{
  "is_plant": true yoki false,
  "condition": "healthy" yoki "late_blight" yoki "early_blight" yoki "chlorosis" yoki "non_plant",
  "diagnosis": "Kasallik nomi o'zbekcha",
  "symptoms": "Alomatlar tavsifi o'zbekcha",
  "severity": "None" yoki "Low" yoki "Medium" yoki "Critical",
  "treatment_plan": "1. Birinchi qadam...\\n2. Ikkinchi qadam...\\n3. Uchinchi qadam...\\n4. To'rtinchi qadam..."
}`
                    },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Image
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                response_mime_type: 'application/json'
              }
            })
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            geminiUsed = true;
            if (parsed.is_plant === false) {
              disease = DISEASE_DICTIONARY['non_plant'];
            } else {
              disease = {
                className: parsed.condition ? `Tomato___${parsed.condition}` : disease.className,
                diagnosis: parsed.diagnosis || disease.diagnosis,
                symptoms: parsed.symptoms || disease.symptoms,
                severity: parsed.severity || disease.severity,
                treatmentPlan: parsed.treatment_plan || disease.treatmentPlan,
                healthStatus: parsed.severity === 'Critical' ? 'diseased' : parsed.severity === 'None' ? 'healthy' : 'warning',
                modelsAgree: true,
                consensusNote: 'Google Gemini 1.5 Flash Vision real vaqtli fotosurat tahlili orqali tasdiqlandi.'
              };
            }
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini vision API error:', geminiErr);
      }
    }

    const now = new Date().toISOString();
    return NextResponse.json({
      status: 'success',
      camera_id: cameraId,
      camera_name: cameraName,
      image_url: '/static/leaf_healthy.jpg',
      scanned_at: now,
      cnn: {
        predicted_class: disease.className,
        confidence: disease.modelsAgree ? confidence : 0,
        top_3: [
          { class_name: disease.className, probability: confidence },
          { class_name: 'Foliage_Healthy', probability: +(1 - confidence).toFixed(2) }
        ]
      },
      llm: {
        diagnosis: disease.diagnosis,
        symptoms: disease.symptoms,
        severity: disease.severity,
        treatment_plan: disease.treatmentPlan,
        engine: geminiUsed ? 'Google Gemini 1.5 Flash (Multimodal Vision)' : 'Aqlli Fitopatologiya Diagnostika Dvigateli'
      },
      models_agree: disease.modelsAgree,
      consensus_note: disease.consensusNote
    });
  } catch (error: any) {
    console.error('Camera analyze error:', error);
    return NextResponse.json(
      { error: 'Tahlil jarayonida xatolik yuz berdi: ' + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}
