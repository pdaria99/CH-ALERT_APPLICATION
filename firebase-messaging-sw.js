importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

const firebaseConfig = {
    apiKey: "xxxxxxxxxx",
    authDomain: "alert-app-firebase.firebaseapp.com",
    projectId: "alert-app-firebase",
    storageBucket: "alert-app-firebase.appspot.com",
    messagingSenderId: "1028585873154",
    appId: "1:1028585873154:web:cb53c4991857412e372c1b"
  };

  const app = firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  self.addEventListener('notificationclick', async (event) => {
      console.log(event.notification)

      const clientList = await event.waitUntil(clients.matchAll({
        type: "window"
      }).then((clientList) => {
        return clients.openWindow(event.notification.data);
         
      }));  });

  messaging.onBackgroundMessage(function(payload) {

    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
      data: payload.data.url
    };

    self.registration.showNotification(notificationTitle,notificationOptions);
  });

