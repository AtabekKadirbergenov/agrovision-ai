export type Language = 'en' | 'uz' | 'kaa';

export interface Translations {
  appName: string;
  appSubtitle: string;
  roverStatus: string;
  roverActive: string;
  roverBattery: string;
  tabs: {
    overview: string;
    sickPlants: string;
    sandbox: string;
    telemetry: string;
  };
  kpi: {
    totalPlants: string;
    healthy: string;
    warning: string;
    diseased: string;
    activeAnomalies: string;
    lastScan: string;
    healthyRate: string;
  };
  anomaly: {
    detectedTitle: string;
    detectedSubtitle: string;
    normalTitle: string;
    normalSubtitle: string;
    affectedSensors: string;
    zScore: string;
    baselineDeviation: string;
    historicalNorm: string;
    spike: string;
    drop: string;
    normal: string;
  };
  sensors: {
    temperature: string;
    airHumidity: string;
    soilHumidity: string;
    tds: string;
    ec: string;
    ph: string;
    baseline7d: string;
    thresholdBand: string;
    chartTitle: string;
  };
  grid: {
    title: string;
    subtitle: string;
    legendHealthy: string;
    legendWarning: string;
    legendDiseased: string;
    legendSelected: string;
    selectedNode: string;
    viewDetails: string;
    row: string;
    col: string;
  };
  sick: {
    title: string;
    subtitle: string;
    severityAll: string;
    severityCritical: string;
    severityMedium: string;
    severityLow: string;
    quickTreatment: string;
    inspectButton: string;
    emptyText: string;
  };
  modal: {
    plantProfile: string;
    variety: string;
    location: string;
    healthStatus: string;
    beforeAfterTitle: string;
    beforeAfterSubtitle: string;
    scanHistory: string;
    dualAiTitle: string;
    dualAiSubtitle: string;
    cnnTitle: string;
    llmTitle: string;
    consensusAgree: string;
    consensusDisagree: string;
    predictedClass: string;
    confidence: string;
    topCandidates: string;
    visualDiagnosis: string;
    symptoms: string;
    severity: string;
    treatmentPlan: string;
    close: string;
  };
  sandbox: {
    title: string;
    subtitle: string;
    dragDropText: string;
    orBrowse: string;
    presetsTitle: string;
    analyzing: string;
    runAnalysis: string;
    dualAiExecuting: string;
    freshPhotoNotice: string;
  };
  cameras: {
    title: string;
    subtitle: string;
    cam1Title: string;
    cam1Desc: string;
    cam2Title: string;
    cam2Desc: string;
    liveBadge: string;
    offlineBadge: string;
    captureBtn: string;
    analyzing: string;
    analysisResults: string;
    noCaptureYet: string;
    savedNotice: string;
    camUrl: string;
    modeSim: string;
    modeLive: string;
    modeWebcam: string;
    diagnosis: string;
    confidence: string;
    severity: string;
    treatment: string;
    consensus: string;
    viewHistory: string;
  };
  common: {
    loading: string;
    error: string;
    refresh: string;
    active: string;
    offline: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "AgroVision AI",
    appSubtitle: "Autonomous Rover Pathology & Telemetry Intelligence",
    roverStatus: "Rover Status",
    roverActive: "Rover Active • Patrol Line #3",
    roverBattery: "Battery 88%",
    tabs: {
      overview: "Field Overview",
      sickPlants: "Sick Plants Registry",
      sandbox: "Live AI Diagnostic Sandbox",
      telemetry: "Environmental Telemetry",
    },
    kpi: {
      totalPlants: "Total Tracked Plants",
      healthy: "Healthy Plants",
      warning: "Warning / Divergence",
      diseased: "Diseased Plants",
      activeAnomalies: "Sensor Anomalies",
      lastScan: "Last Rover Scan",
      healthyRate: "Healthy Ratio",
    },
    anomaly: {
      detectedTitle: "ENVIRONMENTAL ANOMALY DETECTED",
      detectedSubtitle: "Sensor readings exceed the 7-day rolling statistical baseline (Z-score > 2.2). Immediate root-zone inspection recommended.",
      normalTitle: "ALL SENSORS NORMAL • NO ANOMALIES",
      normalSubtitle: "All microclimate and soil mineralization metrics conform to historical baseline moving averages.",
      affectedSensors: "Anomalous Sensors",
      zScore: "Z-Score",
      baselineDeviation: "Baseline Deviation",
      historicalNorm: "Historical 7-Day Norm",
      spike: "SPIKE",
      drop: "DROP",
      normal: "NORMAL",
    },
    sensors: {
      temperature: "Air Temperature",
      airHumidity: "Air Humidity",
      soilHumidity: "Soil Moisture",
      tds: "Soil Mineralization (TDS)",
      ec: "Electrical Conductivity (EC)",
      ph: "Soil pH Level",
      baseline7d: "7-Day Avg",
      thresholdBand: "Threshold Band (±2σ)",
      chartTitle: "14-Day Microclimate & Root-Zone Time Series",
    },
    grid: {
      title: "Interactive 2D Field Grid Map (5x5 Matrix)",
      subtitle: "Spatial layout of monitored crop nodes. Click any plant coordinate to inspect dual-AI pathology & historical scans.",
      legendHealthy: "Healthy",
      legendWarning: "Warning / Divergence",
      legendDiseased: "Diseased",
      legendSelected: "Selected",
      selectedNode: "Selected Plant Node",
      viewDetails: "View Full Profile & Timeline",
      row: "Row",
      col: "Column",
    },
    sick: {
      title: "Sick & Warning Plants Registry",
      subtitle: "Prioritized triage list of plants flagged with active pathology by CNN or Vision LLM.",
      severityAll: "All Severities",
      severityCritical: "Critical",
      severityMedium: "Medium",
      severityLow: "Low / Abiotic",
      quickTreatment: "Urgent Agronomic Action",
      inspectButton: "Inspect Case",
      emptyText: "No sick plants detected. All crops currently meet health thresholds.",
    },
    modal: {
      plantProfile: "Plant Pathology Profile",
      variety: "Crop Variety",
      location: "Grid Location",
      healthStatus: "Health Status",
      beforeAfterTitle: "Before vs. After Visual Progression",
      beforeAfterSubtitle: "Chronological scan history captured by the autonomous rover. Compare past foliage with current state.",
      scanHistory: "Historical Rover Scans",
      dualAiTitle: "Dual Independent AI Analysis",
      dualAiSubtitle: "Parallel evaluation by PyTorch CNN classifier and Multimodal Vision LLM.",
      cnnTitle: "Custom CNN Classifier (EfficientNet)",
      llmTitle: "Multimodal Vision LLM (Pathology Engine)",
      consensusAgree: "Full Model Consensus (Both Models Agree)",
      consensusDisagree: "Model Divergence Warning (Diagnosis Disagreement)",
      predictedClass: "Predicted Pathology",
      confidence: "Confidence Score",
      topCandidates: "Top Probabilistic Matches",
      visualDiagnosis: "Visual Diagnosis",
      symptoms: "Observed Foliar Symptoms",
      severity: "Severity Level",
      treatmentPlan: "Actionable Treatment Protocol",
      close: "Close Profile",
    },
    sandbox: {
      title: "Live AI Diagnostic Sandbox",
      subtitle: "Upload a fresh leaf photo from your device or rover to run live parallel CNN and Vision LLM diagnosis.",
      dragDropText: "Drag & drop leaf photo here, or click to upload",
      orBrowse: "Supports JPG, PNG, WebP up to 15MB",
      presetsTitle: "Or test with real clinical leaf samples:",
      analyzing: "Running Dual AI Inference...",
      runAnalysis: "Run Dual-Model Diagnosis",
      dualAiExecuting: "CNN & Vision LLM analyzing in parallel...",
      freshPhotoNotice: "Real-time analysis ready. View model consensus below.",
    },
    cameras: {
      title: "Dual Live Rover Cameras (ESP32-CAM)",
      subtitle: "Live video stream from rover cameras with instant dual-AI pathology inference and automated treatment recommendations.",
      cam1Title: "Camera 1: Panoramic Crop Row View",
      cam1Desc: "Front-facing wide lens for plant canopy inspection and row traversal",
      cam2Title: "Camera 2: Macro Leaf Pathology",
      cam2Desc: "High-resolution close-up lens for microscopic foliar symptom detection",
      liveBadge: "LIVE STREAM",
      offlineBadge: "STANDBY / WAITING",
      captureBtn: "Snap Photo & Analyze with AI",
      analyzing: "Dual AI Analyzing Snapshot...",
      analysisResults: "Dual AI Diagnostic & Actionable Advice",
      noCaptureYet: "Click 'Snap Photo' above to capture a frame and run real-time dual-AI diagnosis.",
      savedNotice: "Snapshot saved to archive and evaluated by CNN + Vision LLM",
      camUrl: "Stream IP / Endpoint",
      modeSim: "Demo Video",
      modeLive: "ESP32-CAM Stream",
      modeWebcam: "Webcam",
      diagnosis: "Diagnosis",
      confidence: "Confidence",
      severity: "Severity Level",
      treatment: "Agronomic Treatment Plan",
      consensus: "Model Consensus",
      viewHistory: "Saved Scans",
    },
    common: {
      loading: "Loading telemetry & plant data...",
      error: "Error connecting to server. Retrying...",
      refresh: "Refresh Data",
      active: "Active",
      offline: "Offline",
    },
  },

  uz: {
    appName: "AgroVision AI",
    appSubtitle: "Avtonom Rover Patologiyasi va Telemetriya Nazorati",
    roverStatus: "Rover Holati",
    roverActive: "Rover Faol • 3-patrul chizig'i",
    roverBattery: "Batareya 88%",
    tabs: {
      overview: "Dala Ko'rinishi",
      sickPlants: "Kasallangan O'simliklar",
      sandbox: "Jonli AI Tashxis Qumdon",
      telemetry: "Atrof-muhit Telemetriyasi",
    },
    kpi: {
      totalPlants: "Jami Kuzatilayotgan O'simliklar",
      healthy: "Sog'lom O'simliklar",
      warning: "Ogohlantirish / Ixtilof",
      diseased: "Kasallangan O'simliklar",
      activeAnomalies: "Sensor Anomaliyalari",
      lastScan: "Oxirgi Rover Skani",
      healthyRate: "Sog'lomlik Ulushi",
    },
    anomaly: {
      detectedTitle: "ATROF-MUHIT ANOMALIYASI ANIQLANDI",
      detectedSubtitle: "Sensor ko'rsatkichlari 7 kunlik statistik me'yordan oshib ketdi (Z-score > 2.2). Ildiz zonasini tekshirish zarur.",
      normalTitle: "BARCHA SENSORLAR ME'YORDA • ANOMALIYA YO'Q",
      normalSubtitle: "Barcha mikroiqlim va tuproq minerallashuvi ko'rsatkichlari o'rtacha tarixiy me'yorlarga mos keladi.",
      affectedSensors: "Anomaliyali Sensorlar",
      zScore: "Z-Ko'rsatkich",
      baselineDeviation: "Me'yordan Og'ish",
      historicalNorm: "7 Kunlik Tarixiy Me'yor",
      spike: "KESKIN O'SISH",
      drop: "KESKIN TUSHISH",
      normal: "ME'YORDA",
    },
    sensors: {
      temperature: "Havo Harorati",
      airHumidity: "Havo Namligi",
      soilHumidity: "Tuproq Namligi",
      tds: "Tuproq Minerallashuvi (TDS)",
      ec: "Elektr O'tkazuvchanlik (EC)",
      ph: "Tuproq pH Darajasi",
      baseline7d: "7 Kunlik O'rtacha",
      thresholdBand: "Chegara Hududi (±2σ)",
      chartTitle: "14 Kunlik Mikroiqlim va Ildiz Zonasi Dinamikasi",
    },
    grid: {
      title: "Interaktiv 2D Dala Xaritasi (5x5 Matritsa)",
      subtitle: "Kuzatuvdagi ekin tugunlarining fazoviy joylashuvi. Ikki tomonlama AI tashxisi va skanlar tarixini ko'rish uchun tanlang.",
      legendHealthy: "Sog'lom",
      legendWarning: "Ogohlantirish / Ixtilof",
      legendDiseased: "Kasallangan",
      legendSelected: "Tanlangan",
      selectedNode: "Tanlangan Ekin Tuguni",
      viewDetails: "To'liq Profil va Tarixni Ko'rish",
      row: "Qator",
      col: "Ustun",
    },
    sick: {
      title: "Kasallangan va Xavfli O'simliklar Ro'yxati",
      subtitle: "CNN yoki Vision LLM tomonidan patologiya aniqlangan o'simliklarning ustuvor nazorat ro'yxati.",
      severityAll: "Barcha Darajalar",
      severityCritical: "Jiddiy / Xavfli",
      severityMedium: "O'rta",
      severityLow: "Yengil / Abiotik",
      quickTreatment: "Shoshilinch Agronomik Chora",
      inspectButton: "Holatni Ko'rish",
      emptyText: "Kasallangan o'simliklar topilmadi. Barcha ekinlar sog'lom.",
    },
    modal: {
      plantProfile: "O'simlik Patologiya Profili",
      variety: "Ekin Navi",
      location: "Xaritadagi Joylashuvi",
      healthStatus: "Salomatlik Holati",
      beforeAfterTitle: "Oldin va Keyin Vizual Rivojlanish",
      beforeAfterSubtitle: "Avtonom rover tomonidan to'plangan xronologik skanlar tarixi. Oldingi barg holatini hozirgisi bilan solishtiring.",
      scanHistory: "Tarixiy Rover Skanlari",
      dualAiTitle: "Ikki Mustaqil AI Tahlili",
      dualAiSubtitle: "PyTorch CNN klassifikatori va Multimodal Vision LLM tomonidan parallel baholash.",
      cnnTitle: "Maxsus CNN Modeli (EfficientNet)",
      llmTitle: "Multimodal Vision LLM (Agro Patologiya)",
      consensusAgree: "To'liq Model Hamfikrligi (Ikkala AI Rozilikda)",
      consensusDisagree: "Model Ixtilofi Ogohlantirishi (Tashxisda Farq)",
      predictedClass: "Taxmin Qilingan Patologiya",
      confidence: "Ishonch Darajasi",
      topCandidates: "Eng Yuqori Ehtimoliy Natijalar",
      visualDiagnosis: "Vizual Tashxis",
      symptoms: "Bargdagi Kuzatilgan Belgilar",
      severity: "Xavf Darajasi",
      treatmentPlan: "Tavsiya Etilgan Davolash Protokoli",
      close: "Yopish",
    },
    sandbox: {
      title: "Jonli AI Tashxis Qumdoni",
      subtitle: "Qurilmangizdan yoki rover kamerasidan yangi barg fotosuratini yuklang va real vaqtda ikkita AI xulosasini oling.",
      dragDropText: "Barg suratini shu yerga tashlang yoki tanlang",
      orBrowse: "JPG, PNG, WebP formatlari (15MB gacha)",
      presetsTitle: "Yoki tayyor klinik barg namunalari bilan tekshiring:",
      analyzing: "Ikkala AI Tahlil Qilmoqda...",
      runAnalysis: "Tashxisni Boshlash",
      dualAiExecuting: "CNN va Vision LLM parallel tahlil qilmoqda...",
      freshPhotoNotice: "Real vaqtli tahlil tayyor. Xulosalarni quyida ko'ring.",
    },
    cameras: {
      title: "Jonli Rover Kameralari (Dual ESP32-CAM)",
      subtitle: "Roverdagi ikkita mustaqil ESP32 kamera orqali real vaqtli video va bir lahzali Dual-AI patologik tahlili.",
      cam1Title: "1-Kamera: Old Panoramik Ko'rinish",
      cam1Desc: "Rover yo'nalishi va ekin qatorlarini umumiy vizual nazorat qilish",
      cam2Title: "2-Kamera: Makro Barg Patologiyasi",
      cam2Desc: "Bargdagi mikro-kasalliklar va zararkunandalarni yaqindan aniqlash",
      liveBadge: "JONLI EFIR",
      offlineBadge: "KUTILMOQDA / KUTISH",
      captureBtn: "Suratga olish va AI bilan tahlil qilish",
      analyzing: "Ikkala AI suratni tahlil qilmoqda...",
      analysisResults: "Sun'iy Intellekt Xulosasi va Davolash Rejasi",
      noCaptureYet: "Jonli oqimdan kadr olish va AI tashxisini ko'rish uchun yuqoridagi 'Suratga olish' tugmasini bosing.",
      savedNotice: "Kadr saqlandi va CNN + Vision LLM tomonidan tahlil qilindi",
      camUrl: "Kamera IP oqimi",
      modeSim: "Test Video",
      modeLive: "ESP32-CAM Oqimi",
      modeWebcam: "Veb-kamera",
      diagnosis: "Tashxis",
      confidence: "Ishonchlilik",
      severity: "Xavf Darajasi",
      treatment: "Agronomik Davolash Rejasi",
      consensus: "Modellar Konsensusi",
      viewHistory: "Saqlangan Skanlar",
    },
    common: {
      loading: "Telemetriya va o'simlik ma'lumotlari yuklanmoqda...",
      error: "Serverga ulanishda xatolik. Qayta urinilmoqda...",
      refresh: "Yangilash",
      active: "Faol",
      offline: "Oflayn",
    },
  },

  kaa: {
    appName: "AgroVision AI",
    appSubtitle: "Avtonom Rover Patologiyası hám Telemetriya Qadaǵalawı",
    roverStatus: "Rover Halatı",
    roverActive: "Rover Islep Tur • 3-patrul sızıǵı",
    roverBattery: "Batareya 88%",
    tabs: {
      overview: "Atız Kórinisi",
      sickPlants: "Kesellengen Ósimlikler",
      sandbox: "Janlı AI Diagnostika Qumdonı",
      telemetry: "Qorshaǵan Ortallıq Telemetriyası",
    },
    kpi: {
      totalPlants: "Jámgi Baqlanıp Atırǵan Ósimlikler",
      healthy: "Saw Ósimlikler",
      warning: "Eskertiw / Ayırmashılıq",
      diseased: "Kesellengen Ósimlikler",
      activeAnomalies: "Sensor Anomaliyaları",
      lastScan: "Aqırǵı Rover Skanı",
      healthyRate: "Sawlıq Úlesi",
    },
    anomaly: {
      detectedTitle: "QORSHAǴAN ORTALLIQ ANOMALIYASI ANÍQLANDÍ",
      detectedSubtitle: "Sensor kórsetkishleri 7 kúnlik statistikalıq normadan asıp ketti (Z-score > 2.2). Tamır zonasın tekseriw zárúr.",
      normalTitle: "BARLÍQ SENSORLAR NORMADA • ANOMALIYA JOQ",
      normalSubtitle: "Barlıq mikroklimat hám topıraq minerallasıwı kórsetkishleri ortasha tariyxıy normalarǵa sáykes keledi.",
      affectedSensors: "Anomaliyalı Sensorlar",
      zScore: "Z-Kórsetkish",
      baselineDeviation: "Normadan Awısıw",
      historicalNorm: "7 Kúnlik Tariyxıy Norma",
      spike: "KÚSHLI ÓSIW",
      drop: "KÚSHLI TÚSIW",
      normal: "NORMADA",
    },
    sensors: {
      temperature: "Hawa Temperaturası",
      airHumidity: "Hawa Dımlılıǵı",
      soilHumidity: "Topıraq Dımlılıǵı",
      tds: "Topıraq Minerallasıwı (TDS)",
      ec: "Elektr Ótkeriwishenlik (EC)",
      ph: "Topıraq pH Därejesi",
      baseline7d: "7 Kúnlik Ortasha",
      thresholdBand: "Shegara Aymaǵı (±2σ)",
      chartTitle: "14 Kúnlik Mikroklimat hám Tamır Zonası Dinamikası",
    },
    grid: {
      title: "Interaktiv 2D Atız Kartası (5x5 Matritsa)",
      subtitle: "Baqlawdaǵı egin túyinleriniń keńisliklik jaylasıwı. Eki tárepleme AI diagnostikası hám tariyxın kóriw ushın tańlań.",
      legendHealthy: "Saw",
      legendWarning: "Eskertiw / Ayırmashılıq",
      legendDiseased: "Kesellengen",
      legendSelected: "Tańlanǵan",
      selectedNode: "Tańlanǵan Egin Túyini",
      viewDetails: "Tolıq Profil hám Tariyxtı Kóriw",
      row: "Qatar",
      col: "Baǵana",
    },
    sick: {
      title: "Kesellengen hám Qáwipli Ósimlikler Dizimi",
      subtitle: "CNN yaki Vision LLM tárepinen patologiya anıqlanǵan ósimliklerdiń kózden ótkeriw dizimi.",
      severityAll: "Barlıq Därejeler",
      severityCritical: "Qáwipli / Awır",
      severityMedium: "Ortasha",
      severityLow: "Jeńil / Abiotik",
      quickTreatment: "Shuǵıl Agronomiyalıq Ilaj",
      inspectButton: "Kóriw",
      emptyText: "Kesellengen ósimlikler tabılmadı. Barlıq eginler saw.",
    },
    modal: {
      plantProfile: "Ósimlik Patologiyası Profili",
      variety: "Egin Sortı",
      location: "Kartadaǵı Jaylasıwı",
      healthStatus: "Sawlıq Halatı",
      beforeAfterTitle: "Aldın hám Keyin Vizual Rawajlanıw",
      beforeAfterSubtitle: "Avtonom rover tárepinen jıynalǵan xronologiyalıq skanlar tariyxı. Aldınǵı japıraq halatın házirgisimen salıstırıń.",
      scanHistory: "Tariyxıy Rover Skanları",
      dualAiTitle: "Eki Ǵárezsiz AI Analizi",
      dualAiSubtitle: "PyTorch CNN klassifikatorı hám Multimodal Vision LLM tárepinen parallel bahalaw.",
      cnnTitle: "Arnawlı CNN Modeli (EfficientNet)",
      llmTitle: "Multimodal Vision LLM (Agro Patologiya)",
      consensusAgree: "Tolıq Model Pikirlesligi (Eki AI da Bir Qıylı)",
      consensusDisagree: "Model Ayırmashılıǵı Eskertiw (Diagnostikada Parıq)",
      predictedClass: "Mólsherlengen Patologiya",
      confidence: "İsenim Därejesi",
      topCandidates: "Eń Joqarı Itimallı Nátiyjeler",
      visualDiagnosis: "Vizual Diagnostika",
      symptoms: "Japıraqta Baqlanǵan Belgiler",
      severity: "Qáwip Därejesi",
      treatmentPlan: "Usınıs Etilgen Emlew Protokolı",
      close: "Jabıw",
    },
    sandbox: {
      title: "Janlı AI Diagnostika Qumdonı",
      subtitle: "Qurılmańızdan yaki rover kamerasınan jańa japıraq súwretin júkleń hám real waqıtta eki AI juwmaǵın alıń.",
      dragDropText: "Japıraq súwretin mına jerge taslań yaki tańlań",
      orBrowse: "JPG, PNG, WebP formatları (15MB qa shekem)",
      presetsTitle: "Yaki tayar klinikalıq japıraq úlgileri menen sınań:",
      analyzing: "Eki AI Analiz Qılmaqta...",
      runAnalysis: "Diagnostikanı Baslaw",
      dualAiExecuting: "CNN hám Vision LLM parallel analizlebekte...",
      freshPhotoNotice: "Real waqıtlı analiz tayar. Juwmaqlardı tómende kóriń.",
    },
    cameras: {
      title: "Janlı Rover Kameraları (Dual ESP32-CAM)",
      subtitle: "Roverdegi eki ǵárezsiz ESP32 kamera arqalı real waqıtlı video hám tezkor Dual-AI patologiyalıq analizi.",
      cam1Title: "1-Kamera: Aldı Panoramik Kórinis",
      cam1Desc: "Rover háreketi hám egin qatarların ulıwma vizual qadaǵalaw",
      cam2Title: "2-Kamera: Makro Japıraq Patologiyası",
      cam2Desc: "Japıraqtaǵı mikro-kesellikler hám zıyanlanıwlardı jaqınnan anıqlaw",
      liveBadge: "JANLI EFIR",
      offlineBadge: "KÚTILMEKTE / KÚTIW",
      captureBtn: "Súwretke alıw hám AI menen analizlew",
      analyzing: "Eki AI súwretti analizlebekte...",
      analysisResults: "AI Juwmaǵı hám Emlew Jobası",
      noCaptureYet: "Janlı aǵımnan kadr alıw hám AI diagnostikasın kóriw ushın joqarıdaǵı 'Súwretke alıw' túymesin basıń.",
      savedNotice: "Kadr saqlandı hám CNN + Vision LLM tárepinen analizlendi",
      camUrl: "Kamera IP aǵımı",
      modeSim: "Test Video",
      modeLive: "ESP32-CAM Aǵımı",
      modeWebcam: "Veb-kamera",
      diagnosis: "Diagnostika",
      confidence: "İsenimlilik",
      severity: "Qáwip Därejesi",
      treatment: "Agronomiyalıq Emlew Jobası",
      consensus: "Modeller Pikirlesligi",
      viewHistory: "Saqlanǵan Skanlar",
    },
    common: {
      loading: "Telemetriya hám ósimlik maǵlıwmatları júklenbekte...",
      error: "Serverge jalǵanıwda qátelik. Qaytadan urınılmaqta...",
      refresh: "Jańalaw",
      active: "Aktiv",
      offline: "Oflayn",
    },
  },
};
