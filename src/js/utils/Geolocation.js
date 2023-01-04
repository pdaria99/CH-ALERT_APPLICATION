export default class Geolocation{
    static getGeolocation = (successCallback, failedCallback) => {
        navigator.geolocation.getCurrentPosition(successCallback, failedCallback);
    }
}