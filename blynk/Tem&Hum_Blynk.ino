#define BLYNK_TEMPLATE_ID           "TMPLEFFvxhqk"
#define BLYNK_DEVICE_NAME           "DHT"
#define BLYNK_AUTH_TOKEN            "e-__EJzVPakZwWmAR_mtxjS4gGsu_Gai"
#define BLYNK_PRINT Serial


#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <DHT.h>

char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "Nick";
char pass[] = "Nick130501";

#define DHTPIN D4

#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);
BlynkTimer timer;

void sendSensor()
{
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  Blynk.virtualWrite(V5, t);
  Blynk.virtualWrite(V6, h);
}

void setup()
{
  Serial.begin(115200);

  Blynk.begin(auth, ssid, pass);

  dht.begin();
  
  timer.setInterval(1000L, sendSensor);
}

void loop()
{
  Blynk.run();
  timer.run();
}
