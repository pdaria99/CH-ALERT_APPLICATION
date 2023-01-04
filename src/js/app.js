import setViewByUrl from "./utils/setViewByUrl";
import { auth, firestore, messaging } from "./firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { query, collection, onSnapshot, where, setDoc, doc } from "firebase/firestore";
import './firebase-messaging-sw'
import '../css/style.css';




export let user = null;

onAuthStateChanged(auth, loggedUser => {
    if(loggedUser){

        const q = query(collection(firestore, 'users'), where('uid', '==', loggedUser.uid));
        onSnapshot(q, async snapshot => {
            user = {...snapshot.docs[0].data(), id: snapshot.docs[0].id};

            if(!localStorage.getItem('token_sended')){
                await fetch("https://us-central1-alert-app-firebase.cloudfunctions.net/app/saveMessageToken", {
                    method: 'POST',
                    headers: {
                        "project_id": "1028585873154",
                        "Authorization": "Bearer AIzaSyDpbse7ubMpcj_T2xPF9imfS2-HtoFdvBU",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "token": localStorage.getItem('notifications_token'),
                        "user_id": user.id
                    }),
                })
                localStorage.setItem('token_sended', 1)
            }
            
            const hash = window.location.hash;

            if(hash && hash !== '#/login' && hash !== "#/register"){
                window.history.pushState("", "", hash);
            }
            else{
                if(user.admin){
                    window.history.pushState("", "", `#/homeadmin`);
                }
                else{
                    window.history.pushState("", "", `#/home`);
                } 
            }
            setViewByUrl();

            document.querySelectorAll('a').forEach(link => link.addEventListener('click', switchPage))
        })
    }
    else{
        user = null;
        window.history.pushState("", "", `#/login`);
        setViewByUrl();
        document.querySelectorAll('a').forEach(link => link.addEventListener('click', switchPage))
    }
})

export const switchPage = (e) => {
    if(!e){
        return;
    }

    e.preventDefault();

    const url = e.currentTarget.getAttribute('href');

    window.history.pushState("", "", `#${url}`);

    setViewByUrl();

    document.querySelectorAll('a').forEach(link => link.addEventListener('click', switchPage))
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a').forEach(link => link.addEventListener('click', switchPage))
})

