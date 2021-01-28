/*
    KYMenus
    (c)2020-2021 Trevor D. Brown. All rights reserved.
    
    general.js - JavaScript for handling functions and interface changes shared across all pages within the client interface of KYMenus.
*/

$(() => { 
    // Position the footer
    refitFooter();
});

function refitFooter(){
    // Get the footer element.
    var footerElement = $("#kym-footer");

    // Determine the window's height.
    var windowHeight = $(window).height();

    // Determine the content's height.
    var headerHeight = $("#kym-header").height();
    var bodyHeight = $("#kym-body").height();
    var footerHeight = footerElement.height();
    var contentHeight = headerHeight + bodyHeight + footerHeight;

    // If the content's height is greater than the window's height, position the footer as dynamic.
    // Otherwise, make the footer fixed.
    if (contentHeight >= windowHeight){
        footerElement.removeClass("footer-fixed");
    }else{
        if (!footerElement.hasClass("footer-fixed")){
            footerElement.addClass("footer-fixed");
        }
    }
}

function getGeolocationCoordinates(){
    return new Promise(
        // Resolved promise
        (resolve) => {
            var geolocationResponse = {};

            navigator.geolocation.getCurrentPosition(function(position){
                geolocationResponse.latitude = position.coords.latitude;
                geolocationResponse.longitude = position.coords.longitude;
                geolocationResponse.status = "Success";
        
                resolve(geolocationResponse);
            },
            function(error){
                geolocationResponse.status = "Error";
                geolocationResponse.errorCode = error.code;
        
                if (error.code == error.PERMISSION_DENIED){
                    console.log("Geolocation permission denied by user.");
                }else {
                    console.log(error.code);
                }
        
                resolve(geolocationResponse);
            });
        },
        // Rejected promise
        (reject) => {
            console.log("The promise failed to resolve.");
            reject(null);
        }
    );
    

}