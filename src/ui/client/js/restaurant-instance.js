$(() => {
    getRestaurantData("0b535283-db14-4cde-8e36-33a72c8cc37e").then(function(restaurantData){
        if (restaurantData){
            populatePageFields(restaurantData["queryResponse"]);
        }
    }).then(function(error){
        refitFooter();
    });    
});

function refitFooter(){
    var footerElement = $("#kym-footer");

    if (footerElement.prev().height() >= screen.height){
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
    var restaurantOpenStatusElement = $("#kym-restaurant-open-status");
    var restaurantAddressElement = $("#kym-restaurant-address");
    var restaurantHoursElement = $("#kym-restaurant-hours");
    var restaurantMenuElement = $("#kym-restaurant-menu");

    var basicRestaurantData = allRestaurantData[0].queryResults[0];
    var restaurantHoursData = allRestaurantData[1].queryResults;
    var restaurantMenuData = allRestaurantData[2].queryResults;

    $(document).prop("title", basicRestaurantData["restaurant_name"] + " - KYMenus");

    restaurantNameElement.text(basicRestaurantData["restaurant_name"]);

    restaurantOpenStatusElement.text(determineOperatingStatus(restaurantHoursData));

    restaurantAddressElement.append(basicRestaurantData["address"]);
    restaurantAddressElement.append($("<br />"));
    restaurantAddressElement.append(basicRestaurantData["city_name"] + ", " + basicRestaurantData["state_name"] + " " + basicRestaurantData["zip_code"]);
    
    restaurantHoursData.forEach(dataElement => {
        var newHoursCard = $("<div>", {
            "class": "card"
        });

        var newHoursCardBody = $("<div>", {
            "class": "card-body"
        });

        var newHoursCardTitle = $("<h4>", {
            "class": "card-title"
        });

        var newHoursCardText = $("<p>", {
            "class": "card-text"
        });

        newHoursCardTitle.text(dataElement["day_of_week"]);
        newHoursCardText.text(convertToPreferredTime(dataElement["OpenTime"]) + " - " + convertToPreferredTime(dataElement["CloseTime"]));

        newHoursCardBody.append(newHoursCardTitle);
        newHoursCardBody.append(newHoursCardText);

        newHoursCard.append(newHoursCardBody);

        restaurantHoursElement.append(newHoursCard);
    });

    var restaurantCategoryElementTemplate = $("<div>", {
        "class": "card"
    });

    restaurantMenuData.forEach(dataElement => { 
        var currentRestaurantCategoryCard = restaurantMenuElement.find("div[data-category='" + dataElement["MenuSection"].replace("'", "_") + "']");      // Escaping the field, because single quotes break this. :/ 

        if (currentRestaurantCategoryCard.length > 0){
            var existingRestaurantCategoryBody = currentRestaurantCategoryCard.find(".card-body").first();
            existingRestaurantCategoryBody.append($("<br />"));
            existingRestaurantCategoryBody.append(generateMenuItemCard(dataElement));
        }else {
            var newRestaurantCategoryElement = restaurantCategoryElementTemplate.clone();
            var newRestaurantCategoryElementHeader = $("<div>", {
                "class": "card-header"
            });

            var newRestaurantCategoryElementBody = $("<div>", {
                "class": "card-body"
            });

            newRestaurantCategoryElement.attr("data-category", dataElement["MenuSection"].replace("'", "_"));
            newRestaurantCategoryElementHeader.text(dataElement["MenuSection"]);
            newRestaurantCategoryElementBody.append(generateMenuItemCard(dataElement));
            
            newRestaurantCategoryElement.append(newRestaurantCategoryElementHeader);
            newRestaurantCategoryElement.append(newRestaurantCategoryElementBody);

            restaurantMenuElement.append(newRestaurantCategoryElement);
            
        }
    });

}

function generateMenuItemCard(specifiedRestaurantMenuData){    
    var newMenuItemCard = $("<div>", {
        "class": "card",
        "data-menu-item": specifiedRestaurantMenuData["Name"]
    });

    var newMenuItemCardBody = $("<div>", {
        "class": "card-body"
    });

    var newMenuItemCardTitle = $("<h4>", {
        "class": "card-title"
    });
    
    var newMenuItemCardText = $("<p>", {
        "class": "card-text"
    })

    newMenuItemCardTitle.text(specifiedRestaurantMenuData["Name"]);
    newMenuItemCardText.text(convertToPrice(parseFloat(specifiedRestaurantMenuData["Price"])));

    newMenuItemCardBody.append(newMenuItemCardTitle);
    newMenuItemCardBody.append(newMenuItemCardText);

    newMenuItemCard.append(newMenuItemCardBody);

    return newMenuItemCard;

}

function convertToPrice(floatValue){
    return "$" + floatValue.toFixed(2);
}

function convertToPreferredTime(timeString){
    return new Date("1/1/2000 " + timeString).toLocaleTimeString("en-us", {timeStyle: 'short'});
}

function determineOperatingStatus(restaurantHoursData) {
    var operatingStatusString = "";

    var currentDateTime = new Date();
    var dayOfWeek = currentDateTime.toLocaleDateString("en-us", {weekday: 'long'});

    var entryFound = false;

    restaurantHoursData.forEach(dataElement => {
        if (!entryFound){
            if (dataElement["day_of_week"] == dayOfWeek){
                entryFound = true;
                
                // TODO: figure out better way to do this date conversion...
                var startTime = new Date("1/1/2000 " + dataElement["OpenTime"]);
                var endTime = new Date("1/1/2000 " + dataElement["CloseTime"]);
                var rangeOperatingStatus = dataElement["OperatingStatus"];

                startTime.setFullYear(currentDateTime.getFullYear());
                startTime.setMonth(currentDateTime.getMonth());
                startTime.setDate(currentDateTime.getDate());

                endTime.setFullYear(currentDateTime.getFullYear());
                endTime.setMonth(currentDateTime.getMonth());
                endTime.setDate(currentDateTime.getDate());

                if (startTime <= currentDateTime && currentDateTime <= endTime){
                    operatingStatusString = rangeOperatingStatus;
                }else {
                    if (rangeOperatingStatus == "Open"){
                        operatingStatusString = "Closed";
                    }else{
                        operatingStatusString = "Open";
                    }
                }

            }
        }
    });

    if (!entryFound){
        operatingStatusString = "Unknown";
    }

    return operatingStatusString;

}