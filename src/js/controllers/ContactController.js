import adminContact from "./../../static-components/pages/adminContact.html";
import navbarUser from '../../static-components/partials/navbarUser.html';
import footer from '../../static-components/partials/footer.html';

export default class ContactController{
    render(){
        document.getElementById('app').innerHTML = navbarUser + adminContact + footer;
    }   
}