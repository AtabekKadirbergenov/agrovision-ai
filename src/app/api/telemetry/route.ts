import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function GET() {
  const { history, latest, isSimulated } = serverStore.getLiveTelemetry();

  const anomalousSensors: string[] = [];
  if (latest.temperature > 32.0 || latest.temperature < 15.0) anomalousSensors.push('Harorat');
  if (latest.air_humidity < 40.0 || latest.air_humidity > 85.0) anomalousSensors.push('Havo namligi');
  if (latest.soil_humidity < 45.0) anomalousSensors.push('Tuproq namligi');
  if (latest.tds > 900.0) anomalousSensors.push('Mineralizatsiya (TDS)');
  if (latest.ph < 5.5 || latest.ph > 7.8) anomalousSensors.push('pH kislotaliligi');

  const globalAnomaly = anomalousSensors.length > 0;

  const metrics = {
    temperature: {
      name: 'Harorat',
      current: latest.temperature,
      unit: '°C',
      baseline_mean: 23.5,
      baseline_std: 1.8,
      z_score: +((latest.temperature - 23.5) / 1.8).toFixed(2),
      deviation_percent: +(((latest.temperature - 23.5) / 23.5) * 100).toFixed(1),
      is_anomaly: latest.temperature > 32.0 || latest.temperature < 15.0,
      status_label: latest.temperature > 28 ? 'Spike' : latest.temperature < 18 ? 'Drop' : 'Normal',
      threshold_min: 16.0,
      threshold_max: 30.0,
      min_normal: 18.0,
      max_normal: 26.0
    },
    air_humidity: {
      name: 'Havo Namligi',
      current: latest.air_humidity,
      unit: '%',
      baseline_mean: 64.0,
      baseline_std: 5.2,
      z_score: +((latest.air_humidity - 64.0) / 5.2).toFixed(2),
      deviation_percent: +(((latest.air_humidity - 64.0) / 64.0) * 100).toFixed(1),
      is_anomaly: latest.air_humidity < 40.0 || latest.air_humidity > 85.0,
      status_label: latest.air_humidity > 78 ? 'Spike' : latest.air_humidity < 50 ? 'Drop' : 'Normal',
      threshold_min: 45.0,
      threshold_max: 85.0,
      min_normal: 55.0,
      max_normal: 75.0
    },
    soil_humidity: {
      name: 'Tuproq Namligi',
      current: latest.soil_humidity,
      unit: '%',
      baseline_mean: 68.5,
      baseline_std: 4.1,
      z_score: +((latest.soil_humidity - 68.5) / 4.1).toFixed(2),
      deviation_percent: +(((latest.soil_humidity - 68.5) / 68.5) * 100).toFixed(1),
      is_anomaly: latest.soil_humidity < 45.0,
      status_label: latest.soil_humidity < 50 ? 'Drop' : 'Normal',
      threshold_min: 45.0,
      threshold_max: 85.0,
      min_normal: 60.0,
      max_normal: 80.0
    },
    tds: {
      name: 'Mineralizatsiya (TDS)',
      current: latest.tds,
      unit: 'ppm',
      baseline_mean: 640.0,
      baseline_std: 45.0,
      z_score: +((latest.tds - 640.0) / 45.0).toFixed(2),
      deviation_percent: +(((latest.tds - 640.0) / 640.0) * 100).toFixed(1),
      is_anomaly: latest.tds > 900.0,
      status_label: latest.tds > 850 ? 'Spike' : 'Normal',
      threshold_min: 400.0,
      threshold_max: 900.0,
      min_normal: 500.0,
      max_normal: 750.0
    },
    ec: {
      name: 'Elektr O\'tkazuvchanlik (EC)',
      current: latest.ec,
      unit: 'mS/cm',
      baseline_mean: 1.28,
      baseline_std: 0.12,
      z_score: +((latest.ec - 1.28) / 0.12).toFixed(2),
      deviation_percent: +(((latest.ec - 1.28) / 1.28) * 100).toFixed(1),
      is_anomaly: latest.ec > 1.8,
      status_label: latest.ec > 1.7 ? 'Spike' : 'Normal',
      threshold_min: 0.8,
      threshold_max: 1.8,
      min_normal: 1.0,
      max_normal: 1.5
    },
    ph: {
      name: 'Kislotalilik (pH)',
      current: latest.ph,
      unit: 'pH',
      baseline_mean: 6.45,
      baseline_std: 0.22,
      z_score: +((latest.ph - 6.45) / 0.22).toFixed(2),
      deviation_percent: +(((latest.ph - 6.45) / 6.45) * 100).toFixed(1),
      is_anomaly: latest.ph < 5.5 || latest.ph > 7.8,
      status_label: latest.ph > 7.2 ? 'Spike' : latest.ph < 5.8 ? 'Drop' : 'Normal',
      threshold_min: 5.5,
      threshold_max: 7.5,
      min_normal: 6.0,
      max_normal: 6.8
    }
  };

  return NextResponse.json({
    current_timestamp: latest.timestamp,
    global_anomaly_detected: globalAnomaly,
    global_status_text: globalAnomaly
      ? `Ogohlantirish: ${anomalousSensors.join(', ')} me'yordan og'di!`
      : 'Barcha mikroklimat parametrlari me\'yorda',
    anomalous_sensors: anomalousSensors,
    metrics: metrics,
    history: history,
    is_simulated: isSimulated,
    sensor_source: isSimulated ? 'dynamic_simulation' : 'physical_esp32'
  });
}
