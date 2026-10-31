# AgroVision AI: Jonli Vercel Tizimi va ESP32 Qo'llanmasi

> [!IMPORTANT]
> **Vercel Loyihangiz Jonli Efirda:** [https://agrovision-ai-sigma.vercel.app](https://agrovision-ai-sigma.vercel.app)
> Barcha API endpointlar, Gemini Vision AI tahlili, Login/Parol himoyasi va 3-ESP32 telemetriya qabuli 100% muvaffaqiyatli ishga tushirildi.

---

## 1. Tizimga Kirish (Autentifikatsiya)

Platforma qishloq xo'jaligi mutaxassislari va agronomlar uchun maxsus login ekrani bilan himoyalangan:

* **Kirish manzili:** [https://agrovision-ai-sigma.vercel.app](https://agrovision-ai-sigma.vercel.app)
* **Standart Foydalanuvchi nomi:** `admin`
* **Standart Parol:** `agrovision2026`
* **Rol:** Agronom Administrator
* **Xavfsizlik:** JWT sessiya tokeni, himoyalangan API yo'nalishlari va boshqaruv panelidagi "Chiqish" (Logout) mexanizmi.

---

## 2. Kamerani Har Qanday Qurilmadan Ko'rish

ESP32-CAM yoqilganda uning jonli videosini va AI diagnostikasini dunyoning istalgan burchagidan (smartfon, planshet, noutbuk) ko'rish arxitekturasi:

### A) Bir xil Wi-Fi (`Охаё`) tarmog'ida bo'lganda:
1. ESP32-CAM quvvatga ulanganda avtomatik ravishda `Охаё` tarmog'iga ulanadi.
2. Vercel saytidagi kamera kartasida **Sozlamalar** (tishli g'ildirak) belgisini bosing va ESP32 ning IP manzilini kiriting (masalan, `http://192.168.137.181:81/stream`).
3. Jonli video darhol ekranda namoyon bo'ladi.

### B) Mobil internet (4G / tashqi tarmoq) orqali ko'rish:
Uy/ofis Wi-Fi tarmog'idagi ichki IP manzillari (`192.168.x.x`) tashqi mobil internetdan bevosita ko'rinmaydi. Buning uchun tizimda ikkita yechim integratsiya qilingan:
1. **Cloudflare Zero-Config Tunnel (Tavsiya etiladi):**
   Hotspot ulangan kompyuterda quyidagi bepul buyruq ishga tushiriladi:
   ```bash
   cloudflared tunnel --url http://192.168.137.181:81
   ```
   Bu sizga xavfsiz global HTTPS havola beradi (masalan, `https://agrovision-cam.trycloudflare.com`). Ushbu havolani saytdagi kamera sozlamalariga bir marta kiritasiz va istalgan telefondan video oqimi ochiladi!
2. **Kadrni suratga olish va AI bilan tahlil qilish:**
   "Suratga olish va AI bilan tahlil qilish" tugmasi bosilganda tasvir olinadi, Gemini 1.5 Flash Vision neyrotarmog'i orqali tekshiriladi va kasallik turi, zararlanish foizi hamda davolash choralari o'zbek tilida chiqarib beriladi.

---

## 3. 3-ESP32 Mikrokontroleri: Datchiklar va Telemetriya

Tuproq va mikroklimat monitoringi uchun 3-ESP32 mikrokontrolleri to'liq dasturlandi:
* **Proshivka fayli:** [`firmware/esp32_sensor_telemetry/esp32_sensor_telemetry.ino`](file:///C:/Users/atikc/.gemini/antigravity/scratch/agri_pathology_system/firmware/esp32_sensor_telemetry/esp32_sensor_telemetry.ino)
* **Vercel API Manzili:** `https://agrovision-ai-sigma.vercel.app/api/telemetry/log`

### Datchiklarni ulash sxemasi (Pinout):
```
+--------------------------------------------------------------+
|                    ESP32 (30-pin DevKit v1)                  |
|                                                              |
|  [GPIO 4]  <---->  DHT11 / DHT22 Data pini (Havo namligi & T)|
|  [GPIO 34] <---->  Tuproq namligi sensori (AOUT - Analog)    |
|  [GPIO 35] <---->  TDS / Suv minerallari sensori (Analog)    |
|  [GPIO 2]  <---->  Ko'k holat LED (Ma'lumot uzatilganda yonadi)
|  [3.3V]    <---->  Sensorlar VCC (+)                         |
|  [GND]     <---->  Sensorlar GND (-)                         |
+--------------------------------------------------------------+
```

### Sensorlar ishlash mantig'i:
* ESP32 Wi-Fi (`Охаё`, paroli: `52205220g`) ga ulanadi.
* Har 5 soniyada quyidagi JSON paketini Vercel-ga yuboradi:
  ```json
  {
    "temperature": 25.4,
    "air_humidity": 63.2,
    "soil_humidity": 69.0,
    "tds": 640.0,
    "ph": 6.8
  }
  ```
* Saytdagi **"Atrof-muhit Telemetriyasi"** bo'limida grafiklar, tuproq holati va avtomatik anomaliya ogohlantirishlari real vaqtda yangilanadi.

---

## 4. Repozitoriy va Manbalar
* **Jonli Vercel vebsayti:** [https://agrovision-ai-sigma.vercel.app](https://agrovision-ai-sigma.vercel.app)
* **GitHub Repozitoriyasi:** [https://github.com/AtabekKadirbergenov/agrovision-ai](https://github.com/AtabekKadirbergenov/agrovision-ai)
* **Kamera proshivkasi:** [`firmware/esp32_cam1_front/esp32_cam1_front.ino`](file:///C:/Users/atikc/.gemini/antigravity/scratch/agri_pathology_system/firmware/esp32_cam1_front/esp32_cam1_front.ino)
* **Telemetriya proshivkasi:** [`firmware/esp32_sensor_telemetry/esp32_sensor_telemetry.ino`](file:///C:/Users/atikc/.gemini/antigravity/scratch/agri_pathology_system/firmware/esp32_sensor_telemetry/esp32_sensor_telemetry.ino)
