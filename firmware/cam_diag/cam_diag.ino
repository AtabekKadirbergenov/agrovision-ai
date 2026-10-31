#include <Arduino.h>
#include "esp_camera.h"

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

bool testCam(int xclk, framesize_t fsize, const char* name) {
  Serial.printf("\nTesting %s with XCLK=%d Hz... ", name, xclk);
  
  pinMode(PWDN_GPIO_NUM, OUTPUT);
  digitalWrite(PWDN_GPIO_NUM, HIGH);
  delay(50);
  digitalWrite(PWDN_GPIO_NUM, LOW);
  delay(50);

  camera_config_t config = {};
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
  config.xclk_freq_hz = xclk;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = fsize;
  config.jpeg_quality = 12;
  config.fb_count = 1;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.sccb_i2c_port = -1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("INIT FAILED (0x%x)\n", err);
    return false;
  }
  
  camera_fb_t *fb = esp_camera_fb_get();
  if (fb) {
    Serial.printf("OK! Frame: %u bytes (%dx%d)\n", fb->len, fb->width, fb->height);
    esp_camera_fb_return(fb);
    esp_camera_deinit();
    return true;
  } else {
    Serial.println("FB GET FAILED");
    esp_camera_deinit();
    return false;
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== TESTING OPTIMAL FREQUENCY & RESOLUTION ===");
  testCam(5000000, FRAMESIZE_QVGA, "QVGA @ 5MHz");
  testCam(5000000, FRAMESIZE_VGA, "VGA @ 5MHz");
  testCam(6000000, FRAMESIZE_VGA, "VGA @ 6MHz");
  testCam(8000000, FRAMESIZE_VGA, "VGA @ 8MHz");
  testCam(10000000, FRAMESIZE_VGA, "VGA @ 10MHz");
  Serial.println("=== TEST FINISHED ===");
}

void loop() {
  delay(10000);
}
