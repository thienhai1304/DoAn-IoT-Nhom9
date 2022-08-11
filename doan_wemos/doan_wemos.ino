#include <ESP8266WiFi.h>
#include <InfluxDb.h>
#include <PubSubClient.h>

#define INFLUXDB_HOST "172.31.250.3"   //Enter IP of device running Influx Database
#define WIFI_SSID "UiTiOt-E3.1"              //Enter SSID of your WIFI Access Point
#define WIFI_PASS "UiTiOtAP"          //Enter Password of your WIFI Access Point

const char* mqttServer = "172.31.250.3";
//const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;
const char* mqttUser = "";
const char* mqttPassword = "";

Influxdb influx(INFLUXDB_HOST);

int temp = 0;
int humid = 0;
int wv = 0;
int vane = 0;
float bPR = 0;

int loopCount = 0;
int loopCount2 = 0;
int loopCount3 = 0;
int loopCount4= 0;
int loopCount5 = 0;

String message = "";
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(9600);
  
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to WIFI");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
  
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
 
    if (client.connect("ESP8266Client", mqttUser, mqttPassword )) {
 
      Serial.println("connected");  
 
    } else {
 
      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);
 
    }
  }
  influx.setDb("doan");
  
  client.subscribe("iot/nhom9/temp");
  client.subscribe("iot/nhom9/humid");
  client.subscribe("iot/nhom9/wv");
  client.subscribe("iot/nhom9/bPR");
  client.subscribe("iot/nhom9/vane");
  
  Serial.println("Setup Complete.");
  
}

void loop() {
  client.loop();
}

void callback(char* topic, byte* payload, unsigned int length) {
 
  Serial.print("Message arrived in topic: ");
  Serial.println(topic);
  
  Serial.print("Message:");
  message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
    //Serial.print((char)payload[i]);
  }
  if (strcmp(topic,"iot/nhom9/bPR") == 0) {
    bPR = message.toFloat();
    
    loopCount4++;
    InfluxData row4("BarometricPressure");
    row4.addTag("Unit", "hPA");
    row4.addValue("LoopCount", loopCount4);
    row4.addValue("bPR", bPR);

    influx.write(row4);
  }
  else if (strcmp(topic,"iot/nhom9/wv") == 0) {
    wv = message.toInt();

    loopCount3++;
    InfluxData row3("WindSpeed");
    row3.addTag("Unit", "m/s");
    row3.addValue("LoopCount", loopCount3);
    row3.addValue("Speed", wv);

    influx.write(row3);
  }
  else if (strcmp(topic, "iot/nhom9/temp") == 0) {
    temp = message.toInt();
    
    loopCount++;
    InfluxData row("Temperature");
    row.addTag("Unit", "Celsius");
    row.addValue("LoopCount", loopCount);
    row.addValue("Temp", temp);

    influx.write(row);
  }
  else if (strcmp(topic,"iot/nhom9/humid") == 0) {
    humid = message.toInt();
    
    loopCount2++;
    InfluxData row2("Humidity");
    row2.addTag("Unit", "%");
    row2.addValue("LoopCount", loopCount2);
    row2.addValue("Humid", humid);

    influx.write(row2);
  }
  else if (strcmp(topic,"iot/nhom9/vane") == 0) {
    vane = message.toInt();
    
    loopCount5++;
    InfluxData row5("WindVane");
    row5.addTag("Unit", "Degree");
    row5.addValue("LoopCount", loopCount5);
    row5.addValue("Vane", vane);
    row5.addValue("Speed", wv);
    influx.write(row5);
  }
  Serial.println(message);
}
