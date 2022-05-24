const express = require('express')
const mqtt = require("mqtt");
const app = express()
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')
const path = require('path')
const PORT = 3000

const broker = "mqtt://broker.hivemq.com:1883"
//const broker = "mqtt://172.31.250.153:1883";
const client = mqtt.connect(broker);

var arr = [0, 0, 0.31819805, 0.31819805, 0.6988, 0.81498571, 0.99349753]

const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve('./views/'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./views/'),
};

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: 'thienhailai1304@gmail.com',
      pass: 'Hai8557641'
    }
});

transporter.use('compile', hbs(handlebarOptions))

app.use(express.json());

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
})

// -------- EMAIL ---------
function sendMailPrediction(prediction) {
    var mailOptions = {
        from: '"Lai Thiên Hải" <thienhailai1304@gmail.com>',
        to: 'thienhai1011@gmail.com',
        subject: 'IoT - Group 9 - Rain Prediction',
        template: 'email',
        context: {
          name: 'Hoangdb',
          predict: prediction 
        }
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// ------ MQTT ------
client.on("connect", () => {
    const topic = "iot/nhom9";
    client.subscribe(topic);
});


client.on("message", (topic, message) => {
    var data = message.toString().split(',')

    console.log(`topic: ${topic.toString()} \nmessage: ${data}`)
    
    callName(data)
});

// ------ RUN PYTHON FILE ------
function callName(arr) {
    var spawn = require('child_process').spawn;
    var process = spawn('python', [
      './prediction.py',
      arr[0],
      arr[1],
      arr[2],
      arr[3],
      arr[4],
      arr[5],
      arr[6],
    ]);
    process.stdout.on('data', function(data) {
      console.log(data.toString());
      sendMailPrediction(data.toString())
    });
}

// -------- LISTENING ---------
app.listen(PORT, function(){
    console.log("Your app running on port " + PORT);
})