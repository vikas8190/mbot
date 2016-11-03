/**
 * Created by abhinavmaurya on 11/3/16.
 */
var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var apiai = require('apiai');
var app_ai = apiai("6d88c37356c947429cfe97a91dec8bf7");
app.set('port', (process.env.PORT || 5000))
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// Process application/json
app.use(bodyParser.json())
// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})
// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'mBot') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})
app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {
            text = event.message.text
            var request = app_ai.textRequest(text);
            request.on('response', function(response) {
                console.log(response);
            });

            request.on('error', function(error) {
                console.log(error);
            });

            request.end();
            sendTextMessage(sender, "Text received, echo: " + JSON.stringify(req.body))
        }
    }
    res.sendStatus(200)
})
var token = "EAAZAWk0r8CTEBAM9okCaSWuidMGsf4yvZBauJehUsZAsp3qmbRvvgZAxL8ZA4BJBBMyyFJVJckG1PZCZAGA2EyZCRdr6Wh33mvHMb57gD4hXFFKMYgWeRVWecaHYWQMiDRtxZBfGXkZCZCCPZAzLUUcy1vorFKiJOvDksIVFzZB5JNb7J2gZDZD"
function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})