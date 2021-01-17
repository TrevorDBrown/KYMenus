/*
    KYMenus
    (c)2020-2021 Trevor D. Brown. All rights reserved.
    
    restaurant.js - JavaScript for handling functions and interface changes shared across all pages within the client interface of KYMenus.
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