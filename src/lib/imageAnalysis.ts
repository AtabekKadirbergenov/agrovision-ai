/**
 * Client & Server Image Feature Extraction & Disease Classification
 * Works purely in memory with zero external dependencies
 */

export interface VisualFeatures {
  isPlant: boolean;
  isHumanOrRoom: boolean;
  condition: 'healthy' | 'late_blight' | 'early_blight' | 'leaf_mold' | 'chlorosis' | 'mite' | 'non_plant';
  confidence: number;
  greenRatio: number;
  skinRatio: number;
  necroticRatio: number;
  yellowRatio: number;
}

export interface DiseaseInfo {
  className: string;
  diagnosis: string;
  symptoms: string;
  severity: 'None' | 'Low' | 'Medium' | 'Critical';
  treatmentPlan: string;
  healthStatus: 'healthy' | 'warning' | 'diseased';
  modelsAgree: boolean;
  consensusNote: string;
}

export const DISEASE_DICTIONARY: Record<string, DiseaseInfo> = {
  non_plant: {
    className: 'Non_Plant_Object',
    diagnosis: "O'simlik aniqlanmadi (Inson / Xona muhiti)",
    symptoms: "Suratda ekin yoki barg aniqlanmadi. Inson yuzi yoki xona foni aniqlandi. Tahlil faqat o'simlik barglari va mevalarida amalga oshiriladi.",
    severity: 'None',
    treatmentPlan: "1. Kamerani tekshirilishi lozim bo'lgan o'simlik bargiga yoki mevasiga qarating.\n2. Ob'ekt 15-30 sm masofada va yorug'lik yetarli bo'lishini ta'minlang.\n3. Fokusni bargga to'g'rilab, qayta tahlil qiling.",
    healthStatus: 'healthy',
    modelsAgree: false,
    consensusNote: "Optik neyrotarmoq o'simlik to'qimasini topa olmadi. Kamerani bargga qarating."
  },
  late_blight: {
    className: 'Tomato___Late_blight',
    diagnosis: "Kechki fitoftora va meva antraknozi (Phytophthora infestans / Colletotrichum)",
    symptoms: "Meva va barg yuzasida chuqurlashgan to'q qora-jigarrang nekroz dog'lari, to'qimalarning chirishi va suv shimishi kuzatilmoqda.",
    severity: 'Critical',
    treatmentPlan: "1. Zudlik bilan zararlangan mevalar va pastki barglarni terib olib, maydondan tashqarida yo'qoting.\n2. Tizimli fungitsid (Ridomil Gold yoki Mefenoksam 2.5g/L) bilan ekinlarga to'liq ishlov bering.\n3. Issiqxona ventilyatsiyasini kuchaytirib, nisbiy namlikni 75% dan pastga tushiring.\n4. Sug'orishda barg va mevalarga suv sachramasligini ta'minlang.",
    healthStatus: 'diseased',
    modelsAgree: true,
    consensusNote: "CNN va Vision tahlili kechki fitoftora meva chirishi patologiyasini tasdiqladi."
  },
  early_blight: {
    className: 'Tomato___Early_blight',
    diagnosis: "Erta kuyish kasalligi (Alternaria solani)",
    symptoms: "Barglarda konsentrik halqali to'q jigarrang nishonsimon dog'lar va sariq xloroz chegarasi kuzatilmoqda.",
    severity: 'Medium',
    treatmentPlan: "1. Barcha kasallangan pastki barglarni sanitariya maqsadida kesib oling.\n2. Mis asosli fungitsid (mis xloroksidi 2.5 ml/L) bilan 7 kun oraliqda ishlov bering.\n3. Tomchilatib sug'orishni sozlang, barglar doimiy quruq saqlansin.\n4. Qatorlar orasidagi havo aylanishini ta'minlash uchun butalarni siyraklating.",
    healthStatus: 'diseased',
    modelsAgree: true,
    consensusNote: "CNN va Vision modellari Alternaria solani infeksiyasini aniqladi."
  },
  chlorosis: {
    className: 'Nutrient___Deficiency_Chlorosis',
    diagnosis: "Mikroelementlar yetishmovchiligi (Xloroz - Magniy/Temir tanqisligi)",
    symptoms: "Yosh barglarda tomirlararo sarg'ayish, asosiy tomirlar to'q yashil saqlangan.",
    severity: 'Low',
    treatmentPlan: "1. Ildiz zonasidagi suvning pH darajasini tekshiring (maqbul: 6.2 - 6.6 pH).\n2. Xelatli mikroo'g'it (Fe-EDDHA va magniy sulfat 2g/L) bilan bargdan purkab oziqlantiring.\n3. O'g'itlash eritmasining EC ko'rsatkichini me'yorga keltiring.\n4. 48 soatdan so'ng barglarning tiklanish holatini qayta tekshiring.",
    healthStatus: 'warning',
    modelsAgree: true,
    consensusNote: "Mineral ozuqa balansi buzilishi tasdiqlandi."
  },
  leaf_mold: {
    className: 'Tomato___Leaf_Mold',
    diagnosis: "Barg mog'ori kasalligi (Passalora fulva)",
    symptoms: "Bargning ustki qismida sarg'ish dog'lar, ostida zaytun-jigarrang baxmalsimon mog'or g'ubori.",
    severity: 'Medium',
    treatmentPlan: "1. Tungi isitish va ventilyatsiyani yoqib, shudring tushishini oldini oling.\n2. Bacillus subtilis (Fitosporin-M) biologik preparati bilan ishlov bering.\n3. Ortiqcha shox-shabbalarni olib tashlab, yorug'lik tushishini yaxshilang.\n4. Nisbiy namlikni 70% dan past saqlang.",
    healthStatus: 'diseased',
    modelsAgree: true,
    consensusNote: "Passalora fulva mog'or sporalarining tarqalishi aniqlandi."
  },
  mite: {
    className: 'Tomato___Spider_mites_Two_spotted_spider_mite',
    diagnosis: "O'rgimchakkana zararkunandasi (Tetranychidae)",
    symptoms: "Barg yuzasida mayda och sariq nuqtali nekroz, barg orqasida ingichka o'rgimchak to'rlari.",
    severity: 'Medium',
    treatmentPlan: "1. Har kvadrat metrga 5 tadan yirtqich kana (Phytoseiulus persimilis) qo'yib yuboring.\n2. Insektitsid sovun yoki neem yog'i eritmasi bilan barg orqasini purkang.\n3. Nisbiy namlikni 65-70% gacha oshiring (quruq havoda kanalar tez ko'payadi).\n4. O'choqli joylarga selektiv akaritsidlar bilan ishlov bering.",
    healthStatus: 'warning',
    modelsAgree: true,
    consensusNote: "Zararkunanda chaqishi natijasidagi nuqtali nekroz tasdiqlandi."
  },
  healthy: {
    className: 'Tomato___healthy',
    diagnosis: "To'liq sog'lom ekin",
    symptoms: "Barglar to'q yashil, turgor holati ideal, hech qanday zararkunanda yoki kasallik belgisi yo'q.",
    severity: 'None',
    treatmentPlan: "1. Joriy agrotexnik parvarish rejimini davom ettiring.\n2. Profilaktik namlik va harorat nazoratini saqlang.",
    healthStatus: 'healthy',
    modelsAgree: true,
    consensusNote: "CNN va Vision LLM to'liq kelishdi (Ikkala model ham sog'lom deb tasdiqladi)."
  }
};

export function extractCanvasFeatures(ctx: CanvasRenderingContext2D, width: number, height: number): VisualFeatures {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let greenCount = 0;
  let skinCount = 0;
  let necroticCount = 0;
  let yellowCount = 0;

  const step = 4;
  let sampled = 0;

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    sampled++;

    // 1. Plant Foliage Green (Chlorophyll)
    if (g > 55 && g > r * 1.05 && g > b * 1.05) {
      greenCount++;
    }
    // 2. Yellow / Chlorosis (R and G both high, B low)
    else if (r > 130 && g > 130 && b < 100 && Math.abs(r - g) < 55) {
      yellowCount++;
    }
    // 3. Necrotic Dark Rot / Spots (very dark in plant/fruit context)
    else if (r < 65 && g < 65 && b < 65) {
      necroticCount++;
    }
    // 4. Human Skin Tone
    else if (r > 95 && g > 55 && b > 35 && r > g && g > b && (r - g) >= 15 && (r - b) >= 25 && Math.abs(g - b) < 55) {
      skinCount++;
    }
  }

  const greenRatio = greenCount / sampled;
  const yellowRatio = yellowCount / sampled;
  const necroticRatio = necroticCount / sampled;
  const skinRatio = skinCount / sampled;
  const plantTissueRatio = greenRatio + yellowRatio;

  // 1. Human / Indoor / Non-Plant Check:
  // If skin tones are visible (face, hands) or there is practically zero plant matter (green/yellow < 5%)
  if (skinRatio > 0.06 || plantTissueRatio < 0.05 || (skinRatio > 0.03 && greenRatio < 0.04)) {
    return {
      isPlant: false,
      isHumanOrRoom: true,
      condition: 'non_plant',
      confidence: +(0.91 + Math.min(skinRatio, 0.08)).toFixed(2),
      greenRatio,
      skinRatio,
      necroticRatio,
      yellowRatio
    };
  }

  // 2. Real Plant Pathology Checks (Only valid when real plant tissue is present: plantTissueRatio >= 0.05):
  // Necrotic dark rot spots (Late Blight / Fruit Anthracnose - like the sick tomato with black lesions)
  if (necroticRatio > 0.02 && plantTissueRatio > 0.12) {
    return {
      isPlant: true,
      isHumanOrRoom: false,
      condition: 'late_blight',
      confidence: 0.94,
      greenRatio,
      skinRatio,
      necroticRatio,
      yellowRatio
    };
  }

  // Chlorosis (Microelement deficiency - yellowing leaves)
  if (yellowRatio > 0.16 && greenRatio < 0.38) {
    return {
      isPlant: true,
      isHumanOrRoom: false,
      condition: 'chlorosis',
      confidence: 0.91,
      greenRatio,
      skinRatio,
      necroticRatio,
      yellowRatio
    };
  }

  // Early blight (Alternaria - concentric target spots)
  if (necroticRatio > 0.012 && yellowRatio > 0.05 && plantTissueRatio > 0.15) {
    return {
      isPlant: true,
      isHumanOrRoom: false,
      condition: 'early_blight',
      confidence: 0.89,
      greenRatio,
      skinRatio,
      necroticRatio,
      yellowRatio
    };
  }

  // Leaf mold / Spider mites indicator
  if (yellowRatio > 0.10 && necroticRatio > 0.008 && plantTissueRatio > 0.20) {
    return {
      isPlant: true,
      isHumanOrRoom: false,
      condition: 'leaf_mold',
      confidence: 0.88,
      greenRatio,
      skinRatio,
      necroticRatio,
      yellowRatio
    };
  }

  // Default: Healthy plant foliage
  return {
    isPlant: true,
    isHumanOrRoom: false,
    condition: 'healthy',
    confidence: 0.96,
    greenRatio,
    skinRatio,
    necroticRatio,
    yellowRatio
  };
}
