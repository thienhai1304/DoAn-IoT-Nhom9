const express = require('express')
const mqtt = require("mqtt");
const app = express()
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')
const path = require('path')
const PORT = 3000

//const broker = "mqtt://broker.hivemq.com:1883"
const broker = "mqtt://172.31.250.3:1883";
const client = mqtt.connect(broker);

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
      user: '19520508@gm.uit.edu.vn',
      pass: ''
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
function sendMailPrediction(prediction, suggestion) {
    var mailOptions = {
        from: '"Lai Thiên Hải" <19520508@gm.uit.edu.vn>',
        to: 'thienhailai1304@gmail.com',
        subject: 'IoT - Group 9 - Rain Prediction',
        template: 'email',
        context: {
          name: 'Thien Hai',
          predict: prediction,
          suggest: suggestion
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
    var data = message.toString().split(' ')

    console.log(`topic: ${topic.toString()} \n message: ${data}`)
    const arrOfNum = data.map(str => {
        return Number(str);
    });
    
    var result = scaleInput(arrOfNum)
    callName(result)
});

// ------ Scale Input for Prediction ------
function scaleInput(input) {
    var wv = input[1], max_wv = input[2]

    var wd_rad = input[0] * Math.PI / 180

    var scaled_WX = wv * Math.cos(wd_rad)
    var scaled_WY = wv * Math.sin(wd_rad)

    var scaled_max_WX = max_wv * Math.cos(wd_rad)
    var scaled_max_WY = max_wv * Math.sin(wd_rad)

    var temp = input[3] / 25
    var humid = input[4] / 70

    var bPR = input[5] / 1013

    var output = [scaled_WX, scaled_WY, scaled_max_WX, scaled_max_WY, temp, humid, bPR]

    client.publish('iot/nhom9/temp', String(input[3]))
    client.publish('iot/nhom9/humid', String(input[4]))
    client.publish('iot/nhom9/wv', String(input[1]))
    client.publish('iot/nhom9/bPR', String(input[5]))
    client.publish('iot/nhom9/vane', String(input[0]))

    return output
}

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
        let predict = data.toString().trim()
        console.log(predict);

        var suggestion

        if (predict == 'Light Rain') {
            suggestion = 'Bạn không cần mang áo mưa hay dù… chỉ cần trú tạm một lúc là hết mưa.'
        }
        else if (predict == 'Moderate Rain') {
            suggestion = 'Bạn cần mang áo mưa hay dù.'
        }
        else if (predict == 'Heavy Rain') {
            suggestion = 'Bạn cần mang áo mưa hay dù, đường trơn trượt, tầm nhìn hạn chế, cẩn thận khi di chuyển.'
        }
        else if (predict == 'Violent Rain') {
            suggestion = 'Hãy ở nhà.'
        }
        sendMailPrediction(predict, suggestion)
    });
}

// -------- LISTENING ---------
app.listen(PORT, function(){
    console.log("Your app running on port " + PORT);
})