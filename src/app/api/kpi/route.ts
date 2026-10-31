import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function GET() {
  const plants = serverStore.plants;
  const total = plants.length;
  const healthy = plants.filter(p => p.health_status === 'healthy').length;
  const warning = plants.filter(p => p.health_status === 'warning').length;
  const diseased = plants.filter(p => p.health_status === 'diseased').length;

  const history = serverStore.telemetry;
  const latest = history[history.length - 1];
  const hasAnomaly = latest?.is_anomaly ?? false;

  return NextResponse.json({
    total_plants: total,
    healthy_count: healthy,
    warning_count: warning,
    diseased_count: diseased,
    active_anomalies_count: hasAnomaly ? 1 : 0,
    global_anomaly_detected: hasAnomaly,
    last_scan_timestamp: plants[0]?.last_scanned_at || new Date().toISOString()
  });
}
