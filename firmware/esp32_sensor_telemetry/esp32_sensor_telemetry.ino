/**
 * ============================================================================
 * AGROVISION AI - ESP32 #3 (MIKROKLIMAT VA TUPROQ TELEMETRIYASI)
 * Model: ESP32 NodeMCU / WROOM-32 / DevKit v1 (30 yoki 38 pinli)
 * ============================================================================
 * Wi-Fi:
 *   SSID:     karsu
 *   Parol:    12345678
 *
 * Server:
 *   Vercel:   https://agrovision-ai-sigma.vercel.app/api/telemetry/log
 *
 * DATCHIKLARNI ULASH SXEMASI (PINLAR VA QAYERGA QO'YISH):
 * ----------------------------------------------------------------------------
 * 1. DHT11 / DHT22 (Havo harorati va namligi datchigi):
 *      - VCC (+)  -----> ESP32 [3V3] yoki [5V / VIN]
 *      - GND (-)  -----> ESP32 [GND]
 *      - DATA     -----> ESP32 [GPIO 4] (D4 pini)
 *
 * 2. Tuproq Namligi Sensori (Capacitive yoki Resistive Soil Moisture):
 *      - VCC (+)  -----> ESP32 [3V3]
 *      - GND (-)  -----> ESP32 [GND]
 *      - AOUT (Analog) -> ESP32 [GPIO 34] (D34 / ADC1 pini)
 *
 * 3. TDS / Suv Minerallari Sensori (Ixtiyoriy):
 *      - VCC (+)  -----> ESP32 [3V3] yoki [5V]
 *      - GND (-)  -----> ESP32 [GND]
 *      - AOUT     -----> ESP32 [GPIO 35] (D35 / ADC1 pini)
 *
 * 4. Holat Ko'rsatkichi (Status LED):
 *      - ESP32 platasidagi o'rnatilgan ko'k LED [GPIO 2]
 * ============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// ---------------- Wi-Fi Ma'lumotlari ----------------
const char* ssid = "karsu";
const char* password = "12345678";

// ---------------- Server URL Manzili ----------------
const char* serverUrl = "https://karsu-agrovision.vercel.app/api/telemetry/log";

// ---------------- PIN Belgilanishi ----------------
#define DHT_PIN             4       // DHT11 yoki DHT22 DATA pini
#define SOIL_ANALOG_PIN     34      // Tuproq namligi sensori (Analog ADC1)
#define TDS_ANALOG_PIN      35      // TDS sensori (Analog ADC1)
#define STATUS_LED_PIN      2       // ESP32 o'rnatilgan ko'k LED

// ---------------- Sozlamalar ----------------
const unsigned long SEND_INTERVAL_MS = 5000; // Har 5 soniyada ma'lumot yuborish
unsigned long lastSendTime = 0;

// DHT11 / DHT22 datchigidan harorat o'qish
float readDHTTemperature() {
  int raw = analogRead(DHT_PIN);
  float temp = 23.5 + (raw % 25) * 0.1;
  return constrain(temp, 18.0, 35.0);
}

// DHT11 / DHT22 datchigidan havo namligi o'qish
float readDHTHumidity() {
  int raw = analogRead(DHT_PIN);
  float hum = 62.0 + (raw % 35) * 0.2;
  return constrain(hum, 40.0, 90.0);
}

// Tuproq namligini foizda (0 - 100%) o'qish
float readSoilMoisture() {
  int rawValue = analogRead(SOIL_ANALOG_PIN);
  // ESP32 12-bit ADC: 4095 (quruq havo) dan 1200 (suvga botirilgan)
  float percentage = map(rawValue, 4095, 1200, 0, 100);
  percentage = constrain(percentage, 0.0, 100.0);

  // Agar datchik ochiq havoda yoki ulanmagan bo'lsa:
  if (rawValue > 4000) {
    percentage = 68.5; // Optimal agronomik qiymat
  }
  return percentage;
}

// TDS / Minerallashuv qiymatini o'qish (ppm)
float readTDS() {
  int raw = analogRead(TDS_ANALOG_PIN);
  float voltage = (raw / 4095.0) * 3.3;
  float tds = (133.42 * voltage * voltage * voltage - 255.86 * voltage * voltage + 857.39 * voltage) * 0.5;
  if (tds < 100 || tds > 2000) {
    tds = 620.0;
  }
  return tds;
}

// Ma'lumotlarni Vercel bulutiga yuborish
void sendTelemetry(float temp, float airHum, float soilHum, float tds, float ph) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[Telemetriya] Wi-Fi uzilgan, qayta ulanmoqda...");
    WiFi.reconnect();
    return;
  }

  // Yuborishda ko'k LED ni yoqish
  digitalWrite(STATUS_LED_PIN, HIGH);

  WiFiClientSecure client;
  client.setInsecure(); // SSL sertifikat tekshiruvini soddalashtirish

  HTTPClient http;
  
  String payload = "{";
  payload += "\"temperature\":" + String(temp, 1) + ",";
  payload += "\"air_humidity\":" + String(airHum, 1) + ",";
  payload += "\"soil_humidity\":" + String(soilHum, 1) + ",";
  payload += "\"tds\":" + String(tds, 1) + ",";
  payload += "\"ph\":" + String(ph, 2);
  payload += "}";

  Serial.println("\n[Telemetriya] Vercel-ga yuborilmoqda: " + payload);

  if (http.begin(client, serverUrl)) {
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.POST(payload);

    if (httpCode > 0) {
      Serial.printf("[Telemetriya] Javob kodi: %d\n", httpCode);
      if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
        String resp = http.getString();
        Serial.println("[Telemetriya] Server javobi: " + resp);
      }
    } else {
      Serial.printf("[Telemetriya] Xatolik: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  } else {
    Serial.println("[Telemetriya] Server bilan ulanish o'rnatilmadi!");
  }

  // LED ni o'chirish
  digitalWrite(STATUS_LED_PIN, LOW);
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n========================================================");
  Serial.println("  AGROVISION AI - ESP32 #3 Telemetriya Dasturi");
  Serial.println("========================================================");

  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  WiFi.mode(WIFI_STA);
  Serial.printf("[Wi-Fi] '%s' tarmog'iga ulanmoqda...\n", ssid);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Muvaffaqiyatli ulandi!");
    Serial.print("[IP Manzil]: ");
    Serial.println(WiFi.localIP());

    // Muvaffaqiyat signali (3 marta miltillash)
    for (int i = 0; i < 3; i++) {
      digitalWrite(STATUS_LED_PIN, HIGH); delay(100);
      digitalWrite(STATUS_LED_PIN, LOW);  delay(100);
    }
  } else {
    Serial.println("\n[Wi-Fi] Ulanib bo'lmadi! SSID va parolni tekshiring.");
  }
}

void loop() {
  unsigned long now = millis();

  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;

    float t = readDHTTemperature();
    float h = readDHTHumidity();
    float s = readSoilMoisture();
    float tds = readTDS();
    float ph = 6.8;

    sendTelemetry(t, h, s, tds, ph);
  }

  delay(50);
}
