import homePageAdmin from "./../../static-components/pages/homeAdmin.html";
import navbarAdmin from '../../static-components/partials/navbarAdmin.html';
import footer from '../../static-components/partials/footer.html';
import { user } from "../app";
import setViewByUrl from "../utils/setViewByUrl";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { firestore, storage } from "../firebase/firebase";
import { getDownloadURL, ref, deleteObject } from "firebase/storage";

export default class HomeAdminController{
    constructor(){
        if(!user.admin){
            window.history.pushState("", "", `#/home`);
            setViewByUrl();
        }
        else{
            this.render();
        }
    }

    deleteAlert = async (e, alert) => {
        if(!confirm('Czy na pewno chcesz usunąć ten alert?')){
            return;
        }

        const fileRef = ref(storage, alert.photo_name);
        
        await deleteObject(fileRef);
        await deleteDoc(doc(firestore, 'alerts', alert.id));
        
        e.target.closest('tr').remove();
    }

    changeDistance = async (e, alert, alerts) => {
        let newDistance;
        if(parseInt(alert.distance) + 50 < 200){
            if(confirm(`Czy na pewno chcesz zwiększyć obszar poszukiwań do ${parseInt(alert.distance) + 50} kilometrów?`)){
                newDistance = parseInt(alert.distance) + 50;
            }
        }
        else{
            if(confirm(`Czy na pewno chcesz zwiększyć obszar poszukiwań na całą Polskę?`)){
                newDistance = 'all';
            }
        }

        if(!newDistance){
            return;
        }

        await setDoc(doc(firestore, 'alerts', alert.id), {distance: newDistance}, {merge: true})
        alerts.find(el => el.id === alert.id).distance = newDistance;
        e.target.closest('tr').querySelectorAll('td')[5].innerText = newDistance === "all" ? 'Cała Polska' : newDistance + " km";
       
        if(newDistance === 'all'){
            e.target.parentElement.innerText = "Maksymalny obszar poszukiwań"
        }

        await fetch("https://us-central1-alert-app-firebase.cloudfunctions.net/app/sendAlertToUsers", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: `Zwiększono obszar poszukiwań osoby: ${alert.personal_data}`,
                body: "Zobacz szczegóły",
                url: "https://ch-alert.pl/#/alert/" + alert.id
            }),
        })
        
    }

    getAllAlerts = async () => {
        const alerts = [];
        const querySnapshot = await getDocs(collection(firestore, "alerts"));
        querySnapshot.forEach((doc) => {
          alerts.push({
            id: doc.id,
            ...doc.data(),
          })
        });
        return alerts;
    }

    renderAlertsTable = async alerts => {
        const alertsTBody = document.querySelector("#alerts_tbody");

        const createTd = async (alert, index) => {
            const tr = document.createElement('tr');

            const indexTd = document.createElement('td');
            indexTd.innerText = index + 1;
            tr.appendChild(indexTd);
        
            const personalDataTd = document.createElement('td');
            personalDataTd.innerText = alert.personal_data;
            tr.appendChild(personalDataTd);

            const informationTd = document.createElement('td');
            informationTd.innerText = alert.information;
            tr.appendChild(informationTd);

            const photoUrl = await getDownloadURL(ref(storage, alert.photo_name));

            const photoTd = document.createElement('td');
            const photoA = document.createElement('a');
            photoA.href = photoUrl;
            photoA.target = "_blank";

            const photoImg = document.createElement('img');
            photoImg.src = photoUrl;
            photoImg.style.maxWidth = "50px";
            photoA.appendChild(photoImg);

            photoTd.appendChild(photoA);
            tr.appendChild(photoTd);

            const notificationTd = document.createElement('td');
            const notificationsLink = document.createElement('a');
            notificationsLink.classList.add('btn', 'btn-secondary');
            notificationsLink.innerText = "Zgłoszenia";

            notificationsLink.href = `/#/zgloszenia/${alert.id}`

            notificationsLink.addEventListener('click', () => {
                setTimeout(() => setViewByUrl(), 200);
            })

            notificationTd.appendChild(notificationsLink)
            tr.appendChild(notificationTd);

            const distanceTd = document.createElement('td');
            distanceTd.innerText = alert.distance === "all" ? 'Cała Polska' : alert.distance + " km";
            tr.appendChild(distanceTd);

            const changeDistanceTd = document.createElement('td');
            if(alert.distance === 'all'){
                changeDistanceTd.innerText = "Maksymalny obszar poszukiwań";
            }
            else{
                const changeDistanceBtn = document.createElement('button');
                changeDistanceBtn.classList.add('btn', 'btn-secondary');
                changeDistanceBtn.innerText = 'Zwiększ obszar';
                changeDistanceBtn.addEventListener('click', (e) => this.changeDistance(e, alert, alerts))
                changeDistanceTd.appendChild(changeDistanceBtn);
            }
            tr.appendChild(changeDistanceTd);

            const optionsTd = document.createElement('td');
            
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn-danger');
            deleteBtn.innerText = "Usuń alert";
            deleteBtn.addEventListener('click', (e) => this.deleteAlert(e, alert))
            optionsTd.appendChild(deleteBtn);

            tr.appendChild(optionsTd);
            
            alertsTBody.appendChild(tr);

            return true;
        }

        for(let i = 0; i < alerts.length; i++){
            await createTd(alerts[i], i);
        }
    }

    render = async () => {
        document.getElementById('app').innerHTML = navbarAdmin + homePageAdmin + footer;

        const alerts = await this.getAllAlerts();
        this.renderAlertsTable(alerts);
    }   
}