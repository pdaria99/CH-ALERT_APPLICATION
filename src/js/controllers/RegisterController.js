import registerPage from '../../static-components/pages/register.html';
import navbar from '../../static-components/partials/navbar.html';
import footer from '../../static-components/partials/footer.html';

import { auth, firestore } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from "firebase/firestore"; 
import setViewByUrl from '../utils/setViewByUrl';
import Geolocation from '../utils/Geolocation';

export default class RegisterController{
    register = async e => {
        e.preventDefault();

        const errors = this.validation();

        if(errors.length > 0){
            document.querySelector('#app #register_error').style.display = 'block';
            return document.querySelector('#app #register_error').innerHTML = `<ul>${errors.map(el => `<li>${el}</li>`).join('')}</ul>`
        }

        document.querySelector('#app #register_error').innerHTML = '';
        document.querySelector('#app #register_error').style.display = 'none';

        const emailInput = document.getElementById('app').querySelector('form input[name="email"]');
        const passwordInput = document.getElementById('app').querySelector('form input[name="password"]');
        const nameInput = document.getElementById('app').querySelector('form input[name="first_name"]');
        const surnameInput = document.getElementById('app').querySelector('form input[name="last_name"]');
        const phoneInput = document.getElementById('app').querySelector('form input[name="number"]');
        const latInput = document.getElementById('app').querySelector('form input[name="lat"]');
        const lngInput = document.getElementById('app').querySelector('form input[name="lng"]');


        try{
            const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)

            const userObject = {
                firstname: nameInput.value,
                lastname: surnameInput.value,
                email: emailInput.value,
                phone: phoneInput.value,
                lat: latInput.value,
                lng: lngInput.value,
                uid: userCredential.user.uid
            }

            const docRef = await addDoc(collection(firestore, "users"), userObject);

            window.history.pushState("", "", `#/login`);

            setViewByUrl();

        }
        catch(error){
            document.querySelector('#app #register_error').style.display = 'block';

            if(error.code === "auth/email-already-in-use"){
                return document.querySelector('#app #register_error').innerHTML = `<ul><li>Podany email jest już w użyciu!</li></ul>`
            }
     
            return document.querySelector('#app #register_error').innerHTML = `<ul><li>Wystąpił nieznany błąd rejestracji. Spróbuj ponownie.</li></ul>`
        }

    }

    validation = () => {
        return [...this.emailValidation(), ...this.passwordValidation(), ...this.personalDateValidation(), ...this.phoneValidation(), ...this.mapValidation(), ...this.notificationValidator()];
    }

    emailValidation = () => {
        const emailInput = document.getElementById('app').querySelector('form input[name="email"]');
        console.log(emailInput.value)
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailInput.value)){
            return [];
        }
        return ['Wpisz poprawny adres e-mail!']   
    }

    passwordValidation = () => {
        const errors = [];
        const passwordInput = document.getElementById('app').querySelector('form input[name="password"]');
        const passwordRepInput = document.getElementById('app').querySelector('form input[name="password_rep"]');
        
        if(passwordInput.value.length < 10){
            errors.push('Minimalna długość hasła to 10 znaków!');
        }

        if(passwordInput.value.replace(/[^0-9]/g, '').length === 0){
            errors.push('Hasło musi zawierać minimum jedną cyfrę!');
        }
        
        if(passwordInput.value.replace(/[^!@#$%^&*()_+=?><>'~`|]/g, '').length === 0){
            errors.push('Hasło musi zawierać minimum jeden znak specjalny!');
        }

        if(passwordInput.value.replace(/[^a-z]/g, '').length === 0){
            errors.push('Hasło musi zawierać litery!');
        }

        if(passwordInput.value.replace(/[^A-Z]/g, '').length === 0){
            errors.push('Hasło musi zawierać przynajmniej jedną wielką literę!');
        }

        if(passwordInput.value !== passwordRepInput.value){
            errors.push('Hasła różnią się!')
        }
       
        return errors;
    }

    personalDateValidation = () => {
        const errors = [];
        const nameInput = document.getElementById('app').querySelector('form input[name="first_name"]');
        const surnameInput = document.getElementById('app').querySelector('form input[name="last_name"]');

        if(nameInput.value.length < 3){
            errors.push('Minimalna długość imienia to 3 znaki!');
        }

        if(surnameInput.value.length < 2){
            errors.push('Minimalna długość nazwiska to 2 znaki!');
        }

        return errors;
    }

    phoneValidation = () => {
        const errors = [];
        const phoneInput = document.getElementById('app').querySelector('form input[name="number"]');

        if(phoneInput.value.length !== 9){
            errors.push('Numer telefonu musi składać się z 9 znaków!');
        }

        if(phoneInput.value.replace(/[0-9]/g, '').length > 0){
            errors.push('Numer telefonu musi składać się tylko z cyfr!');
        }

        return errors;
    }

    mapValidation = () => {
        const latInput = document.getElementById('app').querySelector('form input[name="lat"]');
        if(latInput.value.length === 0){
            return ['Wyraź zgodnę na geolokalizację!'];
        }
        return [];
    }

    notificationValidator = () => {
        const allowNotificationInput = document.querySelector('input[name="allow_noti"]');
        if(!allowNotificationInput.value){
            return ['Wyraź zgodę na otrzymywanie powiadomień!'];
        }
        return [];
    }

    handleLocationSuccess = ({coords}) => {
        document.getElementById('app').querySelector('form input[name="lat"]').value = coords.latitude
        document.getElementById('app').querySelector('form input[name="lng"]').value = coords.longitude
    }

    handleLocationFailed = () => {
        alert('Geolokalizacja jest niezbędna do rejestracji. Wyraź na nią zgodę a następnie odśwież stronę!')
    }
    
    async render(){
        document.getElementById('app').innerHTML = navbar + registerPage + footer;

        document.getElementById('app').querySelector('form').addEventListener('submit', this.register)
        Geolocation.getGeolocation(this.handleLocationSuccess, this.handleLocationFailed);

        const permissionResult = await Notification.requestPermission();
        if(permissionResult === 'denied'){
            alert('Zezwolenia na powiadomienia jest niezbędne do poprawnego działania aplikacji! Wyraź zgodę na powiadomienia a następnie uruchom ponownie aplikację!');
        }else{
            document.querySelector('input[name="allow_noti"]').value = 1;
        }
    }   
}