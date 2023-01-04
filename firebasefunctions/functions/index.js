const functions = require("firebase-functions");
const admin = require('firebase-admin')
const express = require('express');
const cors = require('cors')({origin: true})
const bodyParser = require('body-parser');

admin.initializeApp({ credential: admin.credential.applicationDefault() }); 

const db = admin.firestore();

const app = express();
app.use(cors);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.post('/saveMessageToken', async (req, res) => {
    const snapshot = await db.collection('user_notification_tokens').get();
    const tokensArray = [];
    snapshot.forEach(el => {
        tokensArray.push(el.data());
    })

    const existToken = tokensArray.find(el => el.token == req.body.token);

    if(existToken){
        res.status(204).send({
            status: 'TOKEN EXISTS'
        });
        return;
    }

    await db.collection('user_notification_tokens').add({
        token: req.body.token,
        user_id: req.body.user_id
    })

    await admin.messaging().subscribeToTopic(req.body.token, 'alerts');

    res.status(204).send({
        status: 'TOKEN ADDED'
    });
})

app.post('/sendAlertToUsers', async (req, res) => {
    const message = {
        data: {
            title: req.body.title,
            body: req.body.body,
            url: req.body.url
        },
        topic: 'alerts'
    };

    await admin.messaging().send(message);

    res.send({
        status: 'ALERT SENDED'
    })
})

exports.app = functions.https.onRequest(app);

