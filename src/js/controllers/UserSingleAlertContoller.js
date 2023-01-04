import userSingleAlert from "./../../static-components/pages/userSingleAlert.html";
import navbarUser from '../../static-components/partials/navbarUser.html';
import footer from '../../static-components/partials/footer.html';
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { firestore, storage } from "../firebase/firebase";
import { getDownloadURL, ref } from "firebase/storage";
import setViewByUrl from "../utils/setViewByUrl";

export default class UserSingleAlertController{

    contructor(){
        this.marker = null;
        this.alert = null;
        this.alertId = null;
        this.clickedMap = null;
    }

    getAlertById = async () => {
        const hash = window.location.hash.split('/').slice(-1).toString();
        const alertSnap = await getDoc(doc(firestore, "alerts", hash));
        const alert = alertSnap.data();

        const photoUrl = await getDownloadURL(ref(storage, alert.photo_name)); 

        this.alertId = hash;
       
        return {
            ...alert,
            photoUrl: photoUrl
        }
    }

    sendToFirebase = async e => {
        e.preventDefault();

        const descriptionTextarea = document.querySelector('textarea[name="description"]');
        const lngInput = document.querySelector('input[name="lng"]');
        const latInput = document.querySelector('input[name="lat"]');

        const errors = this.validate(descriptionTextarea, lngInput)

        if(errors.length > 0){
            document.querySelector('#app #errors_list').style.display = 'block';
            return document.querySelector('#app #errors_list').innerHTML = `<ul>${errors.map(el => `<li>${el}</li>`).join('')}</ul>`
        }

        document.querySelector('#app #errors_list').innerHTML = '';
        document.querySelector('#app #errors_list').style.display = 'none';

        const alertObject = {
            alert_id: this.alertId,
            description: descriptionTextarea.value,
            lat: latInput.value,
            lng: lngInput.value,
            date: new Date().getTime()
        }

        const dbAlert = await addDoc(collection(firestore, "alerts_requests"), alertObject);

        window.history.pushState("", "", `#/home`);
        setViewByUrl();
    }

    validate = (descriptionTextarea, lngInput) => {
        const errors = [];

        if(descriptionTextarea.value.length === 0){
            errors.push('Należy podać opis!');
        }
        if(lngInput.value.length === 0){
            errors.push('Należy wybrać miejsce na mapie!');
        }

        return errors;
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

    showRequestForm = () => {
        document.querySelector('#add_request_container').style.display = "flex";
        setTimeout(() => {
            this.clickedMap.on('load', function () {
                map.resize();
            });
        }, 200)
    }

    render = async () => {
        document.getElementById('app').innerHTML = navbarUser + userSingleAlert + footer;

        const alert = await this.getAlertById();

        document.querySelector('#personal_data').innerHTML = alert.personal_data;
        document.querySelector('#information').innerHTML = alert.information;
        document.querySelector('#photo_name').src = alert.photoUrl

        this.alert = alert;

        mapboxgl.accessToken = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [alert.lng, alert.lat],
            zoom: 9,
        });

        new mapboxgl.Marker()
        .setLngLat([alert.lng, alert.lat])
        .addTo(map);

        this.clickedMap = new mapboxgl.Map({
            container: 'click_map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [alert.lng, alert.lat],
            zoom: 9,
        });

        this.clickedMap.on('dblclick', this.createMarkerOnMap);
        this.clickedMap.on('touchend', this.createMarkerOnMap)

        document.querySelector('form').addEventListener('submit', this.sendToFirebase);
        document.querySelector('#show_add_request_btn').addEventListener('click', this.showRequestForm)
    }   
}
