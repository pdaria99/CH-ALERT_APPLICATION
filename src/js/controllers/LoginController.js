import loginPage from '../../static-components/pages/login.html';
import navbar from '../../static-components/partials/navbar.html';
import footer from '../../static-components/partials/footer.html';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';

export default class LoginController{
    login = async e => {
        e.preventDefault();

        const emailInput = document.getElementById('app').querySelector('form input[name="email"]');
        const passwordInput = document.getElementById('app').querySelector('form input[name="password"]');
        
        const errors = this.validation(emailInput, passwordInput);

        if(errors.length > 0){
            document.querySelector('#app #login_error').style.display = 'block';
            return document.querySelector('#app #login_error').innerHTML = `<ul>${errors.map(el => `<li>${el}</li>`).join('')}</ul>`
        }

        document.querySelector('#app #login_error').innerHTML = '';
        document.querySelector('#app #login_error').style.display = 'none';

        try{
            const userCredential = await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        }
        catch(error){
            document.querySelector('#app #login_error').style.display = 'block';

            return document.querySelector('#app #login_error').innerHTML = `<ul><li>Podano niepoprawne dane logowania!</li></ul>`
        }
        
    }

    validation = (emailInput, passwordInput) => {
        const errors = [];

        if(emailInput.value.length === 0){
            errors.push('Należy podać adres email!');
        }

        if(passwordInput.value.length === 0){
            errors.push('Należy podać hasło!');
        }

        return errors;
    }

    render(){
        document.getElementById('app').innerHTML = navbar + loginPage + footer;
        document.getElementById('app').querySelector('form').addEventListener('submit', this.login)
    }   
}