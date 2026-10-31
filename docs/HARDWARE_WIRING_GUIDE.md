# AgroVision AI: 3 ta ESP32 Ulanish Sxemalari va Datchiklar Qo'llanmasi

## ⚠️ Login Xatoligining Sababi va Yechimi

Siz yuborgan skrinshotdagi xatolik:
> *"Адрес электронной почты должен содержать символ '@'. В адресе 'admin' отсутствует символ '@'"*

**Sababi:** Siz brauzerda eski/begona bo'lgan `https://agrovision-ai.vercel.app` manzilini ochgansiz (u yerda `<input type="email">` bo'lgan).
Biz deploy qilgan haqiqiy loyihangiz manzili:
👉 **[https://agrovision-ai-sigma.vercel.app](https://agrovision-ai-sigma.vercel.app)**

Ushbu haqiqiy havolada:
* Foydalanuvchi nomi oddiy matn (`type="text"`).
* **Login:** `admin` (yoki `admin@agrovision.uz`)
* **Parol:** `agrovision2026`
* Hech qanday `@` so'ramasdan to'g'ridan-to'g'ri tizimga kiradi!

---

## 📶 Wi-Fi Sozlamalari (Barcha 3 ta platada)
* **Wi-Fi Nomi (SSID):** `karsu`
* **Wi-Fi Paroli:** `12345678`

---

## 1. ESP32 #1 — 1-Kamera (Old Panoramik Ko'rinish)

* **Model:** AI-Thinker ESP32-CAM (OV2640 linzasi bilan)
* **Dastur kodi:** [`firmware/esp32_cam1_front/esp32_cam1_front.ino`](file:///C:/Users/atikc/.gemini/antigravity/scratch/agri_pathology_system/firmware/esp32_cam1_front/esp32_cam1_front.ino)
* **mDNS havolasi:** `http://esp32cam1.local:81/stream`

### Dasturlash (Flash) qilish va Quvvat berish ulanishi:
```
FTDI / USB-UART Adapter         ESP32-CAM Platasi
+---------------------+         +-----------------+
|   VCC (5V)          | ------> |  5V             |  <-- "+" (Quvvat)
|   GND               | ------> |  GND            |  <-- "-" (Massa)
|   TXD               | ------> |  U0R (RX)       |
|   RXD               | ------> |  U0T (TX)       |
|                     |         |                 |
|   (Proshivka paytida)         |  IO0 <---> GND  |  <-- Dastur yozishda tutashtiriladi!
+---------------------+         +-----------------+
```
> [!NOTE]
> Proshivka kompyuterdan yuklangandan so'ng, **IO0 va GND o'rtasidagi simni uzib**, ESP32-CAM platasidagi kichik **RST (Reset)** tugmasini bir marta bosing. Shunda kamera Wi-Fi (`karsu`) ga ulanadi.

---

## 2. ESP32 #2 — 2-Kamera (Makro Barg Patologiyasi)

* **Model:** AI-Thinker ESP32-CAM (OV2640)
* **Dastur kodi:** [`firmware/esp32_cam2_macro/esp32_cam2_macro.ino`](file:///C:/Users/atikc/.gemini/antigravity/scratch/agri_pathology_system/firmware/esp32_cam2_macro/esp32_cam2_macro.ino)
* **mDNS havolasi:** `http://esp32cam2.local:81/stream`
* **Ulanishi:** 1-kamera bilan bir xil (5V quvvat va GND).

---

## 3. ESP32 #3 — Datchiklar va Telemetriya Nazorati

* **Model:** ESP32 NodeMCU / WROOM-32 / DevKit v1 (30 yoki 38 pinli)
* **Dastur kodi:** [`firmware/esp32_sensor_telemetry/esp32_sensor_telemetry.ino`](file:///C:/Users/atikc/.gemini/antigravity/scratch/agri_pathology_system/firmware/esp32_sensor_telemetry/esp32_sensor_telemetry.ino)
* **Vercel Bulut Manzili:** `https://agrovision-ai-sigma.vercel.app/api/telemetry/log`

### Datchiklarni Ulanish Jadvali (Qayerga "+" va Pinlarni qo'yish):

| Datchik | Datchikdagi Pin | ESP32-dagi Pin | Vazifasi / Izoh |
| :--- | :--- | :--- | :--- |
| **DHT11 / DHT22** | **VCC (+)** | `3V3` yoki `VIN (5V)` | Sensor quvvati (+) |
| | **GND (-)** | `GND` | Umumiy yer (-) |
| | **DATA / OUT** | `GPIO 4` (D4) | Harorat va havo namligi signali |
| **Tuproq Namligi** | **VCC (+)** | `3V3` | Sensor quvvati (+) |
| | **GND (-)** | `GND` | Umumiy yer (-) |
| | **AOUT (Analog)** | `GPIO 34` (D34) | Tuproq namlik analog signali (ADC1) |
| **TDS Sensori** *(ixtiyoriy)* | **VCC (+)** | `3V3` yoki `VIN` | Sensor quvvati (+) |
| | **GND (-)** | `GND` | Umumiy yer (-) |
| | **AOUT** | `GPIO 35` (D35) | Suv/eritma minerallashuvi (ADC1) |
| **Holat Chirog'i** | Ichki LED | `GPIO 2` | Wi-Fi va telemetriya yuborilganda yonadi |

### Vizual Ulanish Sxemasi:
```
           +---------------------------------------------+
           |               ESP32 DevKit v1               |
           |                                             |
           |  [ 3V3 ]  o----> DHT (+) va Tuproq Sensori (+) [VCC]
           |  [ GND ]  o----> DHT (-) va Tuproq Sensori (-) [GND]
           |                                             |
           |  [ D4  ]  o<---- DHT11 / DHT22 (DATA pini)  |
           |  [ D34 ]  o<---- Tuproq Namligi (AOUT pini) |
           |  [ D35 ]  o<---- TDS Sensori (AOUT pini)    |
           |                                             |
           |  [ D2  ]  * O'rnatilgan ko'k LED indikatori |
           +---------------------------------------------+
```

---

## 4. Dasturni ESP32-larga Yuklash Qadamlari:

1. Kompyuteringizda **Arduino IDE** dasturini oching.
2. `Tools -> Board -> ESP32 Arduino`:
   - 1- va 2-Kameralar uchun: **"AI Thinker ESP32-CAM"**
   - 3-Datchiklar platasi uchun: **"ESP32 Dev Module"**
3. Mos `.ino` faylni oching:
   - 1-kamera: `firmware/esp32_cam1_front/esp32_cam1_front.ino`
   - 2-kamera: `firmware/esp32_cam2_macro/esp32_cam2_macro.ino`
   - 3-datchik: `firmware/esp32_sensor_telemetry/esp32_sensor_telemetry.ino`
4. USB portni tanlab, **Upload** tugmasini bosing.
5. Har bir plata `karsu` tarmog'iga ulanadi va saytingizda ma'lumotlar jonli aks etadi!
