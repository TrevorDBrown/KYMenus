$(() => {
    getRestaurantData("0b535283-db14-4cde-8e36-33a72c8cc37e").then(function(restaurantData){
        if (restaurantData){
            populatePageFields(restaurantData["queryResponse"]["queryResults"][0]);
        }
    });    
});

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

function populatePageFields(restaurantData){
    var restaurantNameElement = $("#kym-restaurant-name");
    var restaurantAddressElement = $("#kym-restaurant-address");

    restaurantNameElement.text(restaurantData["restaurant_name"]);

    restaurantAddressElement.append(restaurantData["address"]);
    restaurantAddressElement.append($("<br />"));
    restaurantAddressElement.append(restaurantData["city_name"] + ", " + restaurantData["state_name"] + " " + restaurantData["zip_code"]);

}