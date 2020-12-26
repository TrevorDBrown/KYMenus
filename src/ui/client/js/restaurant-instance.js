$(() => {
    getRestaurantData("0b535283-db14-4cde-8e36-33a72c8cc37e").then(function(restaurantData){
        if (restaurantData){
            populatePageFields(restaurantData["queryResponse"]);
        }
    }).then(function(){
        refitFooter();
    });    
});

function refitFooter(){
    var footerElement = $("#kym-footer");

    if (footerElement.prev().height() >= screen.height){
        console.log("Body exceeds screen height.");
        footerElement.removeClass("footer-fixed");
    }
}

function getRestaurantData(restaurantPublicID){
    return $.ajax({
        'async': true,
        'global': false,
        'url': "./../api/getRestaurantByPublicID",
        'data': {
          'restaurantPublicID': restaurantPublicID
        },
        'type': "POST"
    });
}

function populatePageFields(allRestaurantData){
    var restaurantNameElement = $("#kym-restaurant-name");
    var restaurantAddressElement = $("#kym-restaurant-address");
    var restaurantHoursElement = $("#kym-restaurant-hours");
    var restaurantMenuElement = $("#kym-restaurant-menu");

    var basicRestaurantData = allRestaurantData[0].queryResults[0];
    var restaurantHoursData = allRestaurantData[1].queryResults;
    var restaurantMenuData = allRestaurantData[2].queryResults;

    $(document).prop("title", basicRestaurantData["restaurant_name"] + " - KYMenus");

    restaurantNameElement.text(basicRestaurantData["restaurant_name"]);

    restaurantAddressElement.append(basicRestaurantData["address"]);
    restaurantAddressElement.append($("<br />"));
    restaurantAddressElement.append(basicRestaurantData["city_name"] + ", " + basicRestaurantData["state_name"] + " " + basicRestaurantData["zip_code"]);

    restaurantHoursElement.text("Hours");
    restaurantHoursElement.append($("<br />"));
    
    restaurantHoursData.forEach(dataElement => {
        restaurantHoursElement.append($("<br />"));
        restaurantHoursElement.append(dataElement["day_of_week"] + ":&emsp;" + dataElement["OpenTime"] + " - " + dataElement["CloseTime"]);
    });

    var restaurantCategoryElementTemplate = $("<div>", {
        "class": "card"
    });

    var restaurantCategoryElements = [];

    restaurantMenuData.forEach(dataElement => {
        var elementExists = false;

        restaurantCategoryElements.forEach(element => {
            if (element.attr("data-category") == dataElement["MenuSection"]){
                elementExists = true;
                
                var existingRestaurantCategoryBody = element.find(".card-body");

                existingRestaurantCategoryBody.append($("<br />"));
                existingRestaurantCategoryBody.append(dataElement["Name"] + ":&emsp;" + dataElement["Price"]);
            }
        });

        if (!elementExists){
            var newRestaurantCategoryElement = restaurantCategoryElementTemplate.clone();
            var newRestaurantCategoryElementHeader = $("<div>", {
                "class": "card-header"
            });

            var newRestaurantCategoryElementBody = $("<div>", {
                "class": "card-body"
            });

            newRestaurantCategoryElement.attr("data-category", dataElement.MenuSection);
            newRestaurantCategoryElementHeader.text(dataElement["MenuSection"]);
            newRestaurantCategoryElementBody.append(dataElement["Name"] + ":&emsp;" + dataElement["Price"]);
            
            newRestaurantCategoryElement.append(newRestaurantCategoryElementHeader);
            newRestaurantCategoryElement.append(newRestaurantCategoryElementBody);

            restaurantCategoryElements.push(newRestaurantCategoryElement);
            
        }
    });

    restaurantCategoryElements.forEach(element => {
        restaurantMenuElement.append(element);
    });

}