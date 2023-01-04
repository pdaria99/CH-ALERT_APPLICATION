import RegisterController from '../controllers/RegisterController'
import LoginController from "../controllers/LoginController";
import AddAlertController from "../controllers/AddAlertController";
import ReportAlertController from "../controllers/ReportAlertController";
import HomeUserController from "../controllers/HomeUserController";
import HomeAdminController from "../controllers/HomeAdminController";
import ContactController from "../controllers/ContactController";
import ReceivedAlertController from '../controllers/ReceivedAlertController';
import UserSingleAlertController from '../controllers/UserSingleAlertContoller';
import AdminSingleRequestController from '../controllers/AdminSingleRequestController';

import { auth } from '../firebase/firebase';
import { user } from '../app';
import { signOut } from 'firebase/auth';
import { switchPage } from '../app';

const setViewByUrl = async () => {
    let hash = window.location.hash;

    if(hash === '#/logout' && user){
        await signOut(auth);
        window.history.pushState("", "", `#/login`);
        hash = '#/login'
    }

    if(hash.startsWith('#/alert/')){
        hash = "userAlert"
    }

    if(hash.startsWith('#/zgloszenia/')){
        hash = "alertRequest"
    }

    switch(hash){
        case 'alertRequest':
            new AdminSingleRequestController().render();
            break;
        case 'userAlert':
            new UserSingleAlertController().render();
            break;
        case '#/login':
            new LoginController().render();
            break;
        case '#/register':
            new RegisterController().render();
            break;
        case '#/adminalert':
            new AddAlertController();
            break;
        case '#/useralert':
            new ReportAlertController().render();
            break;
        case '#/homeadmin':
            new HomeAdminController();
            break;
        case '#/home':
            new HomeUserController().render();
            break;
        case '#/contact':
            new ContactController().render();
            break;
        case '#/receivedalert':
            new ReceivedAlertController().render();
            break;
    }

    document.querySelectorAll('a').forEach(link => link.addEventListener('click', switchPage))
}

export default setViewByUrl;