import adminAlert from "./../../static-components/pages/adminAlert.html";
import navbarAdmin from '../../static-components/partials/navbarAdmin.html';
import footer from '../../static-components/partials/footer.html';
import { user } from "../app";
import setViewByUrl from "../utils/setViewByUrl";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore"; 
import { firestore } from '../firebase/firebase';
import { getMessaging } from "firebase/messaging";

export default class AddAlertController{
    constructor(){
        if(!user.admin){
            window.history.pushState("", "", `#/home`);
            setViewByUrl();
        }
        else{
            this.render();
        }
    }

    sendAlert = async e => {
        e.preventDefault();

        const personaldataInput = document.getElementById('app').querySelector('form input[name="personaldata"]');
        const informationInput = document.getElementById('app').querySelector('form textarea[name="information"]');
        const photoInput = document.getElementById('app').querySelector('form input[name="photo"]');
        const lngInput = document.getElementById('app').querySelector('form input[name="lng"]');
        const latInput = document.getElementById('app').querySelector('form input[name="lat"]');

        const errors = this.validation(personaldataInput, informationInput, photoInput, lngInput, latInput);

        if(errors.length > 0){
            document.querySelector('#app #create_alert_error').style.display = 'block';
            return document.querySelector('#app #create_alert_error').innerHTML = `<ul>${errors.map(el => `<li>${el}</li>`).join('')}</ul>`
        }

        document.querySelector('#app #create_alert_error').innerHTML = '';
        document.querySelector('#app #create_alert_error').style.display = 'none';

        const file = photoInput.files[0];
        const fileName = new Date().getTime() + '.' + file.name.split('.').slice(-1)[0];
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, file);

        const alertObject = {
            personal_data: personaldataInput.value,
            information: informationInput.value,
            photo_name: fileName,
            lat: latInput.value,
            lng: lngInput.value,
            distance: 50
        }

        const dbAlert = await addDoc(collection(firestore, "alerts"), alertObject);

        await fetch("https://us-central1-alert-app-firebase.cloudfunctions.net/app/sendAlertToUsers", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: `Nowe zaginięcie: ${personaldataInput.value}`,
                body: "Zobacz szczegóły",
                url: "https://ch-alert.pl/#/alert/" + dbAlert.id
            }),
        })

        window.history.pushState("", "", `#/homeadmin`);
        setViewByUrl();
    }

    createMarkerOnMap = e => {
        e.preventDefault();
        if(this.marker){
            this.marker.remove();
        }

        this.marker = new mapboxgl.Marker()
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(this.clickedMap);
        
        document.getElementById('app').querySelector('form input[name="lat"]').value = e.lngLat.lat;
        document.getElementById('app').querySelector('form input[name="lng"]').value = e.lngLat.lng;
    }

    validation = (personaldataInput, informationInput, photoInput, lngInput) => {
        const errors = [];

        if(personaldataInput.value.length === 0){
            errors.push('Należy podać dane zaginionego!');
        }
        if(informationInput.value.length === 0){
            errors.push('Należy podać informacje o zaginęciu!');
        }
        if(photoInput.files.length === 0){
            errors.push('Należy wybrać zdjęcie zaginionego!');
        }
        if(lngInput.value.length === 0){
            errors.push('Należy wybrać na mapie miejsce zagnięcia!');
        }

        return errors;
    }

    render(){
        document.getElementById('app').innerHTML = navbarAdmin + adminAlert + footer;

        document.getElementById('app').querySelector('form').addEventListener('submit', this.sendAlert)

        mapboxgl.accessToken = 'xxxxxxxxxxxxxxxxxxxxxxxxx';
        this.clickedMap = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [user.lng, user.lat],
            zoom: 9,
        });

        this.clickedMap.on('dblclick', this.createMarkerOnMap);
        this.clickedMap.on('touchend', this.createMarkerOnMap)
    }   
}