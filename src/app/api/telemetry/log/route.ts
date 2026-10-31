import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const temp = parseFloat(body.temperature);
    const airH = parseFloat(body.air_humidity);
    const soilH = parseFloat(body.soil_humidity);
    const tds = body.tds !== undefined ? parseFloat(body.tds) : 650.0;
    const ph = body.ph !== undefined ? parseFloat(body.ph) : 6.5;

    if (isNaN(temp) || isNaN(airH) || isNaN(soilH)) {
      return NextResponse.json(
        { error: 'Noto\'g\'ri parametrlar: temperature, air_humidity, soil_humidity talab qilinadi' },
        { status: 400 }
      );
    }

    const item = serverStore.pushTelemetry({
      temperature: temp,
      air_humidity: airH,
      soil_humidity: soilH,
      tds: tds,
      ph: ph
    });

    return NextResponse.json({
      status: 'success',
      is_anomaly: item.is_anomaly,
      timestamp: item.timestamp,
      item
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Xatolik' }, { status: 500 });
  }
}
