$(() => {
    // getRestaurantData("0b535283-db14-4cde-8e36-33a72c8cc37e").then(function(restaurantData){
    //     if (restaurantData){
    //         console.log(restaurantData);
    //     }
    // }).then(function(error){
    //     refitFooter();
    // });
    
    refitFooter();

});

function refitFooter(){
    var footerElement = $("#kym-footer");

    var windowHeight = $(window).height();
    var headerHeight = $("#kym-header").height();
    var bodyHeight = $("#kym-body").height();
    var footerHeight = footerElement.height();

    var sumOfElementHeights = headerHeight + bodyHeight + footerHeight;

    if (sumOfElementHeights >= windowHeight){
        footerElement.removeClass("footer-fixed");
    }else{
        if (!footerElement.hasClass("footer-fixed")){
            footerElement.addClass("footer-fixed");
        }
    }
}

// function getRestaurantData(restaurantPublicID){
//     return $.ajax({
//         'async': true,
//         'url': "./../api/getRestaurantByPublicID",
//         'data': {
//           'restaurantPublicID': restaurantPublicID
//         },
//         'type': "POST"
//     });
// }
