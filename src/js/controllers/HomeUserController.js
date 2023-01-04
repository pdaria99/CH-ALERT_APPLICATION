import homePageUser from "./../../static-components/pages/homeUser.html";
import navbarUser from '../../static-components/partials/navbarUser.html';
import footer from '../../static-components/partials/footer.html';
import { getDocs, collection } from "firebase/firestore";
import { firestore, storage } from "../firebase/firebase";
import { user } from "../app";
import { getDownloadURL, ref } from "firebase/storage";
import setViewByUrl from "../utils/setViewByUrl";


export default class HomeUserController{
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

          const optionsTd = document.createElement('td');
          
          const detailsLink = document.createElement('a');
          detailsLink.classList.add('btn', 'btn-secondary');
          detailsLink.innerText = "Szczegóły";
          detailsLink.href = `/#/alert/${alert.id}`

          detailsLink.addEventListener('click', () => {
            setTimeout(() => setViewByUrl(), 200);
          })

          optionsTd.appendChild(detailsLink);

          tr.appendChild(optionsTd);
          
          alertsTBody.appendChild(tr);

          return true;
      }

      for(let i = 0; i < alerts.length; i++){
          await createTd(alerts[i], i);
      }
  }

  render = async () => {
      document.getElementById('app').innerHTML = navbarUser + homePageUser + footer;

      const alerts = await this.getAllAlerts();
      this.renderAlertsTable(alerts);
  }   
}