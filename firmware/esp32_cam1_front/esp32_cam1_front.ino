/**
 * ============================================================================
 * AGROVISION AI - ESP32-CAM #1 (OLD PANORAMIK KAMERA)
 * Model: AI-Thinker ESP32-CAM (OV2640)
 * ============================================================================
 * Wi-Fi:
 *   SSID:     karsu
 *   Parol:    12345678
 *
 * Xususiyatlari:
 *   - Barqaror 8MHz XCLK (OV2640 datchigi barqaror ishlashi uchun)
 *   - MJPEG Stream: port 81 (/stream)
 *   - Capture Snapshot: port 80 (/capture)
 *   - mDNS manzili: http://esp32cam1.local:81/stream
 *   - CORS ruxsatnomalari o'rnatilgan (Brauzer bloklamasligi uchun)
 * ============================================================================
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <esp_http_server.h>
#include <ESPmDNS.h>

// ---------------- Wi-Fi Ma'lumotlari ----------------
const char* ssid = "karsu";
const char* password = "12345678";

// ---------------- AI-Thinker ESP32-CAM PINOUT ----------------
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define FLASH_LED_PIN      4

// HTTP Server obyektlari
httpd_handle_t stream_httpd = NULL;
httpd_handle_t camera_httpd = NULL;

#define PART_BOUNDARY "123456789000000000000987654321"
static const char* _STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char* _STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char* _STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

// MJPEG Stream Handler (Port 81)
static esp_err_t stream_handler(httpd_req_t *req) {
  camera_fb_t *fb = NULL;
  esp_err_t res = ESP_OK;
  size_t _jpg_buf_len = 0;
  uint8_t * _jpg_buf = NULL;
  char * part_buf[64];

  res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
  if (res != ESP_OK) return res;

  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  while (true) {
    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("[Kamera 1] Kadr olishda xatolik!");
      res = ESP_FAIL;
    } else {
      _jpg_buf_len = fb->len;
      _jpg_buf = fb->buf;
    }
    if (res == ESP_OK) {
      size_t hlen = snprintf((char *)part_buf, 64, _STREAM_PART, _jpg_buf_len);
      res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
    }
    if (res == ESP_OK) {
      res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
    }
    if (res == ESP_OK) {
      res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
    }
    if (fb) {
      esp_camera_fb_return(fb);
      fb = NULL;
      _jpg_buf = NULL;
    } else if (res != ESP_OK) {
      break;
    }
  }
  return res;
}

// Yagona rasm (Capture) Handler (Port 80)
static esp_err_t capture_handler(httpd_req_t *req) {
  camera_fb_t *fb = NULL;
  esp_err_t res = ESP_OK;

  fb = esp_camera_fb_get();
  if (!fb) {
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }

  httpd_resp_set_type(req, "image/jpeg");
  httpd_resp_set_hdr(req, "Content-Disposition", "inline; filename=capture_cam1.jpg");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  res = httpd_resp_send(req, (const char *)fb->buf, fb->len);
  esp_camera_fb_return(fb);
  return res;
}

void startCameraServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;

  httpd_uri_t capture_uri = {
    .uri       = "/capture",
    .method    = HTTP_GET,
    .handler   = capture_handler,
    .user_ctx  = NULL
  };

  if (httpd_start(&camera_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(camera_httpd, &capture_uri);
    Serial.println("[Kamera 1] HTTP server ishga tushdi: port 80 (/capture)");
  }

  config.server_port = 81;
  config.ctrl_port = 32769;
  httpd_uri_t stream_uri = {
    .uri       = "/stream",
    .method    = HTTP_GET,
    .handler   = stream_handler,
    .user_ctx  = NULL
  };

  if (httpd_start(&stream_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(stream_httpd, &stream_uri);
    Serial.println("[Kamera 1] MJPEG oqim serveri ishga tushdi: port 81 (/stream)");
  }
}

bool initCamera(uint32_t xclk_hz) {
  // PWDN orqali kamerani toza reset qilish
  pinMode(PWDN_GPIO_NUM, OUTPUT);
  digitalWrite(PWDN_GPIO_NUM, HIGH); // Power down
  delay(50);
  digitalWrite(PWDN_GPIO_NUM, LOW);  // Power up
  delay(50);

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = xclk_hz;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 12;
  config.fb_count = 1;
  config.fb_location = psramFound() ? CAMERA_FB_IN_PSRAM : CAMERA_FB_IN_DRAM;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.sccb_i2c_port = -1;

  esp_err_t err = esp_camera_init(&config);
  return (err == ESP_OK);
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n--- AgroVision AI: ESP32-CAM #1 (Old Panoramik) ---");

  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  // Kamerani barqaror 8MHz da ishga tushirish
  bool camOk = initCamera(8000000);
  if (!camOk) {
    Serial.println("[Kamera 1] 8MHz muvaffaqiyatsiz, 5MHz sinab ko'rilmoqda...");
    camOk = initCamera(5000000);
  }

  if (camOk) {
    Serial.println("[Kamera 1] OV2640 sensori muvaffaqiyatli ishga tushdi!");
  } else {
    Serial.println("[Kamera 1] DIQQAT: Kamera ulanishini tekshiring!");
  }

  // Wi-Fi ga ulanish
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

    if (MDNS.begin("esp32cam1")) {
      Serial.println("[mDNS] http://esp32cam1.local:81/stream tayyor!");
    }

    startCameraServer();
    Serial.println("\n>>> TAYYOR! Jonli oqim havolasi: <<<");
    Serial.printf("http://%s:81/stream\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[Wi-Fi] Ulanib bo'lmadi! SSID va parolni tekshiring.");
  }
}

void loop() {
  delay(10000);
}
