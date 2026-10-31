export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL !== undefined
  ? process.env.NEXT_PUBLIC_API_URL
  : (typeof window !== 'undefined' ? '' : 'http://localhost:3000');

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

export interface PlantBrief {
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
}

export interface PlantDetail extends PlantBrief {
  scans: ScanRecord[];
}

export interface SensorMetric {
  name: string;
  current: number;
  unit: string;
  baseline_mean: number;
  baseline_std: number;
  z_score: number;
  deviation_percent: number;
  is_anomaly: boolean;
  status_label: 'Normal' | 'Spike' | 'Drop';
  threshold_min: number;
  threshold_max: number;
  min_normal: number;
  max_normal: number;
}

export interface TelemetryResponse {
  current_timestamp: string;
  global_anomaly_detected: boolean;
  global_status_text: string;
  anomalous_sensors: string[];
  metrics: Record<string, SensorMetric>;
  history: Array<{
    time: string;
    timestamp: string;
    temperature: number;
    air_humidity: number;
    soil_humidity: number;
    tds: number;
    ec: number;
    ph: number;
    is_anomaly: boolean;
  }>;
}

export interface OverviewKPI {
  total_plants: number;
  healthy_count: number;
  warning_count: number;
  diseased_count: number;
  active_anomalies_count: number;
  global_anomaly_detected: boolean;
  last_scan_timestamp?: string;
}

export interface LiveScanResult {
  plant_id: string;
  image_url: string;
  scanned_at: string;
  cnn_analysis: {
    predicted_class: string;
    confidence_score: number;
    top_3_probabilities: Array<{ class_name: string; confidence: number }>;
    engine: string;
  };
  llm_analysis: {
    visual_diagnosis: string;
    symptom_description: string;
    severity_level: string;
    actionable_treatment_plan: string;
    engine: string;
  };
  models_agree: boolean;
  consensus_note: string;
  plant_health_status: string;
}

// Fetch helper with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, credentials: "omit", signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function getKPIs(): Promise<OverviewKPI> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/kpi`);
  if (!res.ok) throw new Error("Failed to fetch KPIs");
  return res.json();
}

export async function getPlants(): Promise<PlantBrief[]> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/plants`);
  if (!res.ok) throw new Error("Failed to fetch plants");
  return res.json();
}

export async function getPlantDetail(id: string): Promise<PlantDetail> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/plants/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch plant ${id}`);
  return res.json();
}

export async function getTelemetry(): Promise<TelemetryResponse> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/telemetry`);
  if (!res.ok) throw new Error("Failed to fetch telemetry");
  return res.json();
}

export async function uploadScan(file: File | Blob, plantId?: string): Promise<LiveScanResult> {
  const formData = new FormData();
  formData.append("image", file);
  if (plantId) {
    formData.append("plant_id", plantId);
  }

  const res = await fetch(`${API_BASE_URL}/api/scan`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Scan analysis failed.");
  }
  return res.json();
}

export interface CameraAnalysisResult {
  status: string;
  camera_id: string;
  camera_name: string;
  image_url: string;
  scanned_at: string;
  cnn: {
    predicted_class: string;
    confidence: number;
    top_3: Array<{ class_name: string; confidence: number }>;
  };
  llm: {
    diagnosis: string;
    symptoms: string;
    severity: string;
    treatment_plan: string;
    engine: string;
  };
  models_agree: boolean;
  consensus_note: string;
}

export async function analyzeCameraSnapshot(
  blob: Blob,
  cameraId: string,
  cameraName: string
): Promise<CameraAnalysisResult> {
  const formData = new FormData();
  formData.append("image", blob, `camera_${cameraId}.jpg`);
  formData.append("camera_id", cameraId);
  formData.append("camera_name", cameraName);

  const res = await fetch(`${API_BASE_URL}/api/camera/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Kamera kadrini tahlil qilishda xatolik yuz berdi.");
  }
  return res.json();
}

export async function getGeminiKeyStatus(): Promise<{ has_key: boolean; masked_key: string; engine: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/config/gemini-key`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return { has_key: false, masked_key: "", engine: "Visual Foliage Validator & Rule Engine" };
}

export async function saveGeminiKey(apiKey: string): Promise<{ success: boolean; has_key: boolean; engine: string }> {
  const res = await fetch(`${API_BASE_URL}/api/config/gemini-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) throw new Error("Kalitni saqlab bo'lmadi");
  return res.json();
}
