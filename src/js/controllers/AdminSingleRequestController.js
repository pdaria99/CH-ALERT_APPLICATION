import adminSingleRequest from "./../../static-components/pages/adminSingleRequest.html";
import navbarAdmin from '../../static-components/partials/navbarAdmin.html';
import footer from '../../static-components/partials/footer.html';
import { doc, getDoc, addDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore, storage } from "../firebase/firebase";


export default class AdminSingleRequestController{

    getRequestByAlertId = async () => {
        return new Promise((resolve) => {
            const hash = window.location.hash.split('/').slice(-1).toString();

            const colRef = collection(firestore, 'alerts_requests');
            const q = query(colRef, where('alert_id', '==', hash))
    
            onSnapshot(q, (snap) => {
                const requests = [];
    
                snap.docs.forEach(doc => {
                    requests.push(doc.data());
                })
    
                resolve(requests);
            })
        })
    }

    generateRequestsElements = requests => {
        const wrapper = document.querySelector('#requests_wrapper');

        requests.forEach(request => {
            const column = document.createElement('div');
            column.classList.add('col-md-6', 'mb-4');

            const card = document.createElement('div');
            card.classList.add('card');

            const mapWrapper = document.createElement('div');
            mapWrapper.style.height = "300px";
            mapboxgl.accessToken = 'pk.eyJ1IjoibWlrcmEyNSIsImEiOiJja3AybGJpcDcxZnIwMndueHlxOGhqbXdrIn0.0302zXfI3PmlgcS4ICmOAA';
            const map = new mapboxgl.Map({
                container: mapWrapper,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [request.lng, request.lat],
                zoom: 9,
            });

            new mapboxgl.Marker()
            .setLngLat([request.lng, request.lat])
            .addTo(map);

            map.on('load', function () {
                map.resize();
            });
            

            card.appendChild(mapWrapper);

            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            const cardTitle = document.createElement('h5');
            cardTitle.classList.add('card-title');
            cardTitle.innerText = new Date(request.date).toLocaleString();
            cardBody.appendChild(cardTitle);

            const cardText = document.createElement('p');
            cardText.classList.add('card-text');
            cardText.innerHTML = request.description;
            cardBody.append(cardText);

            card.appendChild(cardBody);
            column.appendChild(card);
            wrapper.appendChild(column);
        })
    }


    render = async () => {
        document.getElementById('app').innerHTML = navbarAdmin + adminSingleRequest + footer;
    
        const requests = await this.getRequestByAlertId();
        this.generateRequestsElements(requests)
    }   
}
