// In-Memory Cloud Data Store for Vercel Deployment

export interface ScanRecord {
  id: number;
  plant_id: string;
  image_url: string;
  scanned_at: string;
  cnn_predicted_class: string;
  cnn_confidence: number;
  cnn_top_3?: string;
  llm_diagnosis: string;
  llm_symptom_description: string;
  llm_severity_level: 'Low' | 'Medium' | 'Critical' | 'None';
  llm_treatment_plan: string;
  models_agree: boolean;
  consensus_note?: string;
}

export interface Plant {
  id: string;
  name: string;
  variety: string;
  grid_x: number;
  grid_y: number;
  row_label: string;
  col_label: string;
  health_status: 'healthy' | 'warning' | 'diseased';
  created_at: string;
  last_scanned_at: string;
  latest_scan?: ScanRecord;
  scans: ScanRecord[];
}

export interface TelemetryItem {
  time: string;
  timestamp: string;
  temperature: number;
  air_humidity: number;
  soil_humidity: number;
  tds: number;
  ec: number;
  ph: number;
  is_anomaly: boolean;
  anomaly_details?: string;
}

// Initial Telemetry History
const generateInitialTelemetry = (): TelemetryItem[] => {
  const items: TelemetryItem[] = [];
  const now = Date.now();
  for (let i = 24; i >= 0; i--) {
    const t = new Date(now - i * 5 * 60 * 1000);
    const temp = +(23.0 + Math.sin(i / 3) * 1.8 + (Math.random() - 0.5) * 0.4).toFixed(1);
    const airH = +(62.0 + Math.cos(i / 4) * 4.0 + (Math.random() - 0.5) * 0.8).toFixed(1);
    const soilH = +(68.0 + Math.sin(i / 5) * 3.0 + (Math.random() - 0.5) * 0.5).toFixed(1);
    const tds = +(620.0 + Math.sin(i / 2) * 40.0 + (Math.random() - 0.5) * 10.0).toFixed(1);
    const ec = +(tds / 500.0).toFixed(2);
    const ph = +(6.4 + (Math.random() - 0.5) * 0.15).toFixed(2);
    const isAnom = i === 2 ? true : false; // recent mild spike for demo
    items.push({
      time: t.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      timestamp: t.toISOString(),
      temperature: temp,
      air_humidity: airH,
      soil_humidity: soilH,
      tds: isAnom ? 920.0 : tds,
      ec: isAnom ? 1.84 : ec,
      ph: ph,
      is_anomaly: isAnom,
      anomaly_details: isAnom ? 'Mineralizatsiya cho\'qqisi (TDS: 920 ppm)' : undefined
    });
  }
  return items;
};

// Initial 25 Plants
const generateInitialPlants = (): Plant[] => {
  const varieties = [
    'San Marzano Pomidor', 'Roma Pomidor', 'Cherokee Purple', 'Beefsteak Pomidor',
    'Shirin Qalampir', 'Jalapeno Qalampir', 'Bolgar Qalampiri', 'Qora Baqlajon'
  ];

  const now = new Date().toISOString();
  const plants: Plant[] = [];
  let counter = 1;

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const pid = `plant_${String(counter).padStart(2, '0')}`;
      const variety = varieties[(r * 5 + c) % varieties.length];
      let status: 'healthy' | 'warning' | 'diseased' = 'healthy';

      if ((r === 1 && c === 2) || (r === 3 && c === 1) || (r === 4 && c === 3)) {
        status = 'diseased';
      } else if ((r === 0 && c === 4) || (r === 2 && c === 0) || (r === 4 && c === 1)) {
        status = 'warning';
      }

      let scan: ScanRecord;
      if (status === 'diseased') {
        scan = {
          id: counter,
          plant_id: pid,
          image_url: '/static/leaf_blight_late.jpg',
          scanned_at: now,
          cnn_predicted_class: 'Tomato___Early_blight',
          cnn_confidence: 0.94,
          cnn_top_3: JSON.stringify([
            { class_name: 'Tomato___Early_blight', probability: 0.94 },
            { class_name: 'Tomato___Late_blight', probability: 0.04 },
            { class_name: 'Tomato___healthy', probability: 0.02 }
          ]),
          llm_diagnosis: 'Pomidor erta kuyishi (Alternarioz)',
          llm_symptom_description: 'Barg sathida konsentrik sariq hoshiyali nekrotik qoramtir dog\'lar, to\'qimalar qurishi kuzatilgan.',
          llm_severity_level: 'Critical',
          llm_treatment_plan: '1. Kasallangan barglarni kesib olib yo\'q qiling.\n2. Mis xloroksid (XOM) yoki Ridomil Gold (2.5 g/l) bilan purkang.\n3. Tomchilatib sug\'orish tizimiga o\'ting, barglarni ho\'llamang.\n4. 7 kundan so\'ng qayta tekshiruv o\'tkazing.',
          models_agree: true,
          consensus_note: 'CNN va Vision LLM to\'liq kelishdi (Ikkala model ham Alternariozni tasdiqladi).'
        };
      } else if (status === 'warning') {
        scan = {
          id: counter,
          plant_id: pid,
          image_url: '/static/leaf_deficiency.jpg',
          scanned_at: now,
          cnn_predicted_class: 'Tomato___healthy',
          cnn_confidence: 0.58,
          cnn_top_3: JSON.stringify([
            { class_name: 'Tomato___healthy', probability: 0.58 },
            { class_name: 'Tomato___Early_blight', probability: 0.32 },
            { class_name: 'Tomato___Septoria_leaf_spot', probability: 0.10 }
          ]),
          llm_diagnosis: 'Magniy va azot yetishmovchiligi (Xloroz)',
          llm_symptom_description: 'Tomirlararo sarg\'ayish va oziq yetishmasligi belgilari, zamburug\'li patogen aniqlanmadi.',
          llm_severity_level: 'Medium',
          llm_treatment_plan: '1. Magniy sulfat (0.2%) eritmasi bilan bargdan oziqlantiring.\n2. Tuproq pH darajasini 6.2-6.6 oralig\'iga keltiring.\n3. Organik gumus qo\'shing.',
          models_agree: false,
          consensus_note: 'Modellar tafovuti: CNN sog\'lom deb baholadi, ammo Vision LLM xlorozni aniqladi.'
        };
      } else {
        scan = {
          id: counter,
          plant_id: pid,
          image_url: '/static/leaf_healthy.jpg',
          scanned_at: now,
          cnn_predicted_class: 'Tomato___healthy',
          cnn_confidence: 0.99,
          cnn_top_3: JSON.stringify([
            { class_name: 'Tomato___healthy', probability: 0.99 },
            { class_name: 'Tomato___Early_blight', probability: 0.005 },
            { class_name: 'Tomato___Bacterial_spot', probability: 0.005 }
          ]),
          llm_diagnosis: 'To\'liq sog\'lom ekin',
          llm_symptom_description: 'Barglar to\'q yashil, turgor holati ideal, hech qanday zararkunanda yoki kasallik belgisi yo\'q.',
          llm_severity_level: 'None',
          llm_treatment_plan: '1. Joriy agrotexnik parvarish rejimini davom ettiring.\n2. Profilaktik namlik nazoratini saqlang.',
          models_agree: true,
          consensus_note: 'Ikkala AI modeli ham o\'simlik 100% sog\'lom ekanini tasdiqladi.'
        };
      }

      plants.push({
        id: pid,
        name: `Node [${r + 1},${c + 1}] Alfa-${counter}`,
        variety: variety,
        grid_x: c,
        grid_y: r,
        row_label: `Qator ${r + 1}`,
        col_label: `Ustun ${c + 1}`,
        health_status: status,
        created_at: now,
        last_scanned_at: now,
        latest_scan: scan,
        scans: [scan]
      });

      counter++;
    }
  }

  return plants;
};

// Global memory cache (persists in warm lambdas & development server)
class ServerStore {
  plants: Plant[] = generateInitialPlants();
  telemetry: TelemetryItem[] = generateInitialTelemetry();
  latestFrameBase64: string | null = null;
  latestFrameTime: number = 0;
  geminiApiKey: string = process.env.GEMINI_API_KEY || '';
  lastPhysicalSensorTime: number = 0;

  recordPhysicalTelemetry(data: {
    temperature: number;
    air_humidity: number;
    soil_humidity: number;
    tds?: number;
    ec?: number;
    ph?: number;
  }) {
    this.lastPhysicalSensorTime = Date.now();
    return this.pushTelemetry(data);
  }

  isPhysicalSensorActive(): boolean {
    return Date.now() - this.lastPhysicalSensorTime < 25000;
  }

  // Real-time dynamic microclimate generator when physical sensors are disconnected
  getLiveTelemetry(): { history: TelemetryItem[]; latest: TelemetryItem; isSimulated: boolean } {
    const isPhysical = this.isPhysicalSensorActive();

    if (isPhysical) {
      const latest = this.telemetry[this.telemetry.length - 1];
      return { history: this.telemetry, latest, isSimulated: false };
    }

    // Dynamic continuous simulation based on current wall-clock time
    const now = new Date();
    const epochSec = Math.floor(Date.now() / 1000);
    const minuteOfDay = now.getHours() * 60 + now.getMinutes();

    // Natural diurnal curve (peak daytime ~14:00, coolest ~05:00)
    const diurnalAngle = ((minuteOfDay - 360) / 1440) * Math.PI * 2;
    const baseTemp = 23.2 + Math.sin(diurnalAngle) * 3.2;

    // Second & minute micro-fluctuations (living greenhouse microclimate)
    const microWave1 = Math.sin(epochSec / 15) * 0.4;
    const microWave2 = Math.cos(epochSec / 6) * 0.2;
    const liveTemp = +(baseTemp + microWave1 + microWave2).toFixed(1);

    // Air humidity inversely proportional to temperature (55% to 75%)
    const baseHum = 64.0 - Math.sin(diurnalAngle) * 6.5;
    const humWave = Math.sin(epochSec / 19) * 0.9;
    const liveHum = +Math.max(45, Math.min(82, baseHum + humWave)).toFixed(1);

    // Soil moisture gently undulating (66% to 72%)
    const soilWave = Math.sin(epochSec / 40) * 1.6 + Math.cos(epochSec / 12) * 0.4;
    const liveSoil = +(68.8 + soilWave).toFixed(1);

    // Mineralization TDS (620 to 665 ppm)
    const tdsWave = Math.sin(epochSec / 25) * 16.0 + Math.sin(epochSec / 9) * 5.0;
    const liveTds = +(636.0 + tdsWave).toFixed(1);
    const liveEc = +(liveTds / 500.0).toFixed(2);

    // Soil pH value (6.48 to 6.62)
    const phWave = Math.sin(epochSec / 50) * 0.07;
    const livePh = +(6.54 + phWave).toFixed(2);

    const timeStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    const lastItem = this.telemetry[this.telemetry.length - 1];

    const currentLiveItem: TelemetryItem = {
      time: timeStr,
      timestamp: now.toISOString(),
      temperature: liveTemp,
      air_humidity: liveHum,
      soil_humidity: liveSoil,
      tds: liveTds,
      ec: liveEc,
      ph: livePh,
      is_anomaly: false
    };

    // If minute has ticked forward or history is empty, advance history series
    if (!lastItem || lastItem.time !== timeStr) {
      this.telemetry.push(currentLiveItem);
      if (this.telemetry.length > 30) {
        this.telemetry.shift();
      }
    } else {
      // Keep latest fluctuating live
      this.telemetry[this.telemetry.length - 1] = currentLiveItem;
    }

    return {
      history: this.telemetry,
      latest: currentLiveItem,
      isSimulated: true
    };
  }

  pushTelemetry(data: {
    temperature: number;
    air_humidity: number;
    soil_humidity: number;
    tds?: number;
    ec?: number;
    ph?: number;
  }) {
    const now = new Date();
    const temp = +data.temperature.toFixed(1);
    const airH = +data.air_humidity.toFixed(1);
    const soilH = +data.soil_humidity.toFixed(1);
    const tds = +(data.tds ?? 650.0).toFixed(1);
    const ec = +(data.ec ?? (tds / 500.0)).toFixed(2);
    const ph = +(data.ph ?? 6.5).toFixed(2);

    const isAnom = tds > 900.0 || soilH < 45.0 || ph < 5.5 || ph > 7.8;
    const anomDetails = isAnom
      ? (tds > 900 ? `TDS oshishi: ${tds} ppm` : soilH < 45 ? `Tuproq qurishi: ${soilH}%` : `pH buzilishi: ${ph}`)
      : undefined;

    const item: TelemetryItem = {
      time: now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now.toISOString(),
      temperature: temp,
      air_humidity: airH,
      soil_humidity: soilH,
      tds: tds,
      ec: ec,
      ph: ph,
      is_anomaly: isAnom,
      anomaly_details: anomDetails
    };

    this.telemetry.push(item);
    if (this.telemetry.length > 50) {
      this.telemetry.shift();
    }
    return item;
  }

  setLatestFrame(base64Jpeg: string) {
    this.latestFrameBase64 = base64Jpeg;
    this.latestFrameTime = Date.now();
  }

  getLatestFrame(): string | null {
    return this.latestFrameBase64;
  }
}

// Singleton global across HMR
const globalForStore = globalThis as unknown as { serverStore: ServerStore };
export const serverStore = globalForStore.serverStore || new ServerStore();
if (process.env.NODE_ENV !== 'production') globalForStore.serverStore = serverStore;
