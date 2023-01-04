import { app } from "./firebase/firebase";
import { getMessaging, getToken, onMessage,  } from "firebase/messaging";

const messaging = getMessaging(app);

getToken(messaging, { vapidKey: 'xxxxxxxx' }).then(async (currentToken) => {
    if (currentToken) {
      localStorage.setItem('notifications_token', currentToken);
    }
  }).catch((err) => {
   
  });

