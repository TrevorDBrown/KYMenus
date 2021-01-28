/*
    KYMenus
    (c)2020-2021 Trevor D. Brown. All rights reserved.
    
    restaurant.js - JavaScript for handling functions and interface changes to the /restaurants/ page.
*/

$(() => {
    // Fetch Geolocation Data
    getGeolocationCoordinates().then((geolocationData) => {
        console.log(geolocationData);
    });

});