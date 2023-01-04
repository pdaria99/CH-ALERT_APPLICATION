import userAlert from "./../../static-components/pages/userAlert.html";
import navbarUser from '../../static-components/partials/navbarUser.html';
import footer from '../../static-components/partials/footer.html';

import { user } from "../app";

export default class ReportAlertController{
    render(){
        document.getElementById('app').innerHTML = navbarUser + userAlert + footer;
    }   
}