import homePageAdmin from "./../../static-components/pages/homeAdmin.html";
import navbarAdmin from '../../static-components/partials/navbarAdmin.html';
import footer from '../../static-components/partials/footer.html';


export default class ReceivedAlertController{

    render(){
        document.getElementById('app').innerHTML = navbarAdmin + homePageAdmin + footer;
    }   
}
