/*
    KYMenus
    (c)2020-2021 Trevor D. Brown. All rights reserved.
    
    ui.ts - TypeScript for UI assembly.
*/

import * as cheerio from 'cheerio';
import * as path from 'path';
import * as fs from 'fs';

function prepareRestaurantInstanceBaseTemplate(): {baseTemplate?: string, error?: string} {
    var response: {baseTemplate?: string, error?: string} = {};

    var baseTemplate: Buffer = fs.readFileSync(path.join(__dirname, './../../support/ui/restaurant-template.html'));

    if (baseTemplate){
        response = {baseTemplate: baseTemplate.toString()};
    }else{
        response = {error: "File not found."};
    }

    return response;

}

function convertToPriceString(floatValue: number): string{
    return "$" + floatValue.toFixed(2);
}

function convertToPreferredTimeString(timeString: string): string{
    // Format the string to: MM/DD/YYYY HH:MI:SS AM/PM
    var baseDateTimeString: string = new Date("1/1/2000 " + timeString).toLocaleTimeString("en-us");
    // Remove the seconds from the date/time string and return.
    return baseDateTimeString.substring(baseDateTimeString.length - 6, 0) + baseDateTimeString.substring(baseDateTimeString.length, baseDateTimeString.length - 3);
}

function generateOperatingStatusString(restaurantHoursData: any): string {
    var operatingStatusString = "";

    var currentDateTime = new Date();
    var dayOfWeek = currentDateTime.toLocaleDateString("en-us", {weekday: 'long'});

    var entryFound = false;

    restaurantHoursData.forEach((dataElement: any) => {
        if (!entryFound){
            if (dataElement["day_of_week"] == dayOfWeek){
                entryFound = true;

                // TODO: is the a better way to handle this??
                var startTime = new Date("\"" + (currentDateTime.getMonth() + 1).toString() + "/" + currentDateTime.getDate().toString() + "/" + currentDateTime.getFullYear().toString() + "\" " + dataElement["OpenTime"]);
                var endTime = new Date("\"" + (currentDateTime.getMonth() + 1).toString() + "/" + currentDateTime.getDate().toString() + "/" + currentDateTime.getFullYear().toString() + "\" " + dataElement["CloseTime"]);
                var rangeOperatingStatus = dataElement["OperatingStatus"];

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

    return operatingStatusString;

}

function generateAddressInfoCard(restaurantAddressElement: cheerio.Cheerio, basicRestaurantData: any): cheerio.Cheerio {
    var $: cheerio.Root = cheerio.load("");
    var breakElement = $("<br />");

    if (!basicRestaurantData.address){
        var newRestaurantAddressInfoNotFoundErrorElement: cheerio.Cheerio = $("<h5>");
        newRestaurantAddressInfoNotFoundErrorElement.text("No Address Information Available.");
        restaurantAddressElement.append(newRestaurantAddressInfoNotFoundErrorElement);
    }else{
        restaurantAddressElement.append(basicRestaurantData["address"]);
        restaurantAddressElement.append(breakElement.clone());
        restaurantAddressElement.append(basicRestaurantData["city_name"] + ", " + basicRestaurantData["state_name"] + " " + basicRestaurantData["zip_code"]);
    }

    return restaurantAddressElement;
}

function generateContactInfoCard(restaurantContactInfoElement: cheerio.Cheerio, restaurantContactInfoData: any): cheerio.Cheerio {
    var $: cheerio.Root = cheerio.load("");
    var breakElement = $("<br />");

    if (restaurantContactInfoData.length <= 0){
        var newRestaurantContactInfoNotFoundErrorElement: cheerio.Cheerio = $("<h5>");
        newRestaurantContactInfoNotFoundErrorElement.text("No Contact Information Available.");
        restaurantContactInfoElement.append(newRestaurantContactInfoNotFoundErrorElement);
    }else{
        restaurantContactInfoData.forEach((contactInfoEntry: any) => {        
            var baseLink: cheerio.Cheerio = $("<a>");
            var hrefData: string = "";

            // Determine what type of link will be displayed.
            switch (contactInfoEntry.category_name){
                case "Phone":
                    hrefData = "tel:1" + contactInfoEntry.category_value.replaceAll("-", "");
                    break;
                case "Email":
                    hrefData = "mailto:" + contactInfoEntry.category_value;
                    break;
                case "Website":
                    hrefData = contactInfoEntry.category_value;
                    break;
                case "Online Menu":
                    hrefData = contactInfoEntry.category_value;
                    break;
                case "Online Ordering":
                    hrefData = contactInfoEntry.category_value;
                    break;
            }

            // If the link is defined, then set the href value of the anchor tag.
            if (hrefData != ""){
                baseLink.attr("href", hrefData);
                baseLink.attr("target", "_blank");
            }

            // Determine if the value will be displayed as custom text, or the actual value.
            if (contactInfoEntry.display_text){
                baseLink.text(contactInfoEntry.display_text);
            }else{
                baseLink.text(contactInfoEntry.category_value);
            }

            // Add to the parent element, along with a break tag.
            restaurantContactInfoElement.append(baseLink);
            restaurantContactInfoElement.append(breakElement.clone());
        
        });
    }

    return restaurantContactInfoElement;
}

function generateCategoriesCards (categoriesElement: cheerio.Cheerio, categoriesData: any): cheerio.Cheerio {
    var $: cheerio.Root = cheerio.load("");

    var breakElement: cheerio.Cheerio = $("<br />");

    if (categoriesData.length <= 0){
        var newRestaurantCategoriesNotFoundErrorElement: cheerio.Cheerio = $("<h5>");
        newRestaurantCategoriesNotFoundErrorElement.text("No Categories Available.");
        categoriesElement.append(newRestaurantCategoriesNotFoundErrorElement);
    }else{

        categoriesData.forEach((dataElement: any) => {
            if (dataElement.display_category == 1){
                categoriesElement.append(dataElement.category_name);
                categoriesElement.append(breakElement.clone());
            } 
        });

    }

    return categoriesElement;
}

function generateOperatingHoursCards(operatingHoursElement: cheerio.Cheerio, operatingHoursData: any): cheerio.Cheerio{
    var $: cheerio.Root = cheerio.load("");

    if (operatingHoursData.length <= 0){
        var newRestaurantHoursNotFoundErrorElement: cheerio.Cheerio = $("<h5>");
        newRestaurantHoursNotFoundErrorElement.text("No Hours Available.");
        operatingHoursElement.append(newRestaurantHoursNotFoundErrorElement);
    }else{
        operatingHoursData.forEach((dataElement: any) => {

            var newHoursCard: cheerio.Cheerio = $("<div>");
            newHoursCard.addClass("card kym-hours-entry-card");
            newHoursCard.prop("id", "kym-hours-card-" + dataElement["day_of_week"]);
    
            var newHoursCardRow = $("<div>");
            newHoursCardRow.addClass("row");
    
            var newHoursCardCol = $("<div>");
            newHoursCardCol.addClass("col-xs-12 col-sm-12 col-md-12 col-lg-6 col-xl-6");
    
            var newHoursCardBody = $("<div>");
            newHoursCardBody.addClass("card-body");
    
            var newHoursCardTitle = $("<h4>");
            newHoursCardTitle.addClass("card-title");
    
            var newHoursCardText = $("<p>");
            newHoursCardText.addClass("card-text");
    
            newHoursCardTitle.text(dataElement["day_of_week"]);
            newHoursCardText.text(convertToPreferredTimeString(dataElement["OpenTime"]) + " - " + convertToPreferredTimeString(dataElement["CloseTime"]));
    
            var dayOfWeekCol = newHoursCardCol.clone();
            dayOfWeekCol.append(newHoursCardTitle);
    
            var hoursCol = newHoursCardCol.clone();
            hoursCol.append(newHoursCardText);
    
            newHoursCardRow.append(dayOfWeekCol);
            newHoursCardRow.append(hoursCol);
    
            newHoursCardBody.append(newHoursCardRow);
    
            newHoursCard.append(newHoursCardBody);
    
            operatingHoursElement.append(newHoursCard);
        });
    }

    return operatingHoursElement;
}

function generateMenuCard(restaurantMenuElement: cheerio.Cheerio, restaurantMenuData: any): cheerio.Cheerio {
    var $: cheerio.Root = cheerio.load("");

    var restaurantCategoryElementTemplate: cheerio.Cheerio = $("<div>");
    restaurantCategoryElementTemplate.addClass("card kym-menu-category-card");

    if (restaurantMenuData.length <= 0){
        var newRestaurantMenuNotFoundErrorElement: cheerio.Cheerio = $("<h5>");
        newRestaurantMenuNotFoundErrorElement.text("No Menu Available.");
        restaurantMenuElement.append(newRestaurantMenuNotFoundErrorElement);
    }else{
        restaurantMenuData.forEach((dataElement: any) => { 
            var newRestaurantCategoryElementSafeName = dataElement["MenuSection"].replace("'", "_").replace(/\s/g, "_");
            var currentRestaurantCategoryCard = restaurantMenuElement.find("div[data-category='" + newRestaurantCategoryElementSafeName + "']");

            if (currentRestaurantCategoryCard.length > 0){
                var existingRestaurantCategoryBody = currentRestaurantCategoryCard.find(".card-body").first();
                existingRestaurantCategoryBody.append($("<br />"));
                existingRestaurantCategoryBody.append(generateMenuItemCard(dataElement));
            }else {
                var newRestaurantCategoryElement = restaurantCategoryElementTemplate.clone();
                var newRestaurantCategoryElementHeader = $("<div>");
                newRestaurantCategoryElementHeader.addClass("card-header");
                newRestaurantCategoryElementHeader.attr("data-toggle", "collapse");
                newRestaurantCategoryElementHeader.attr("data-target", "#kym-menu-category-" + newRestaurantCategoryElementSafeName);
                newRestaurantCategoryElementHeader.attr("aira-expanded", "false");
                newRestaurantCategoryElementHeader.attr("aira-controls", "#kym-menu-category-" + newRestaurantCategoryElementSafeName);

                var newRestaurantCategoryElementBody = $("<div>");
                newRestaurantCategoryElementBody.addClass("card-body collapse");
                newRestaurantCategoryElementBody.attr("id", "kym-menu-category-" + newRestaurantCategoryElementSafeName);

                newRestaurantCategoryElement.attr("data-category", newRestaurantCategoryElementSafeName);
                newRestaurantCategoryElementHeader.text(dataElement["MenuSection"]);
                newRestaurantCategoryElementBody.append(generateMenuItemCard(dataElement));
                
                newRestaurantCategoryElement.append(newRestaurantCategoryElementHeader);
                newRestaurantCategoryElement.append(newRestaurantCategoryElementBody);

                restaurantMenuElement.append(newRestaurantCategoryElement);  
            }
        });
    }

    return restaurantMenuElement;
}

function generateMenuItemCard(specifiedRestaurantMenuData: any): cheerio.Cheerio{
    var $: cheerio.Root = cheerio.load("");

    var newMenuItemCard: cheerio.Cheerio = $("<div>");
    newMenuItemCard.addClass("card kym-menu-item-card");
    newMenuItemCard.prop("data-menu-item", specifiedRestaurantMenuData["Name"]);

    var newMenuItemCardBody: cheerio.Cheerio = $("<div>");
    newMenuItemCardBody.addClass("card-body");

    var newMenuItemCardTitle: cheerio.Cheerio = $("<h4>");
    newMenuItemCardTitle.addClass("card-title");
    
    var newMenuItemCardText: cheerio.Cheerio = $("<p>");
    newMenuItemCardText.addClass("card-text");

    newMenuItemCardTitle.text(specifiedRestaurantMenuData["Name"]);
    newMenuItemCardText.text(convertToPriceString(parseFloat(specifiedRestaurantMenuData["Price"])));

    if (specifiedRestaurantMenuData.Description){
        var newMenuItemCardRow = $("<div>");
        newMenuItemCardRow.addClass("row");

        var newMenuItemCardLeftCol = $("<div>");
        newMenuItemCardLeftCol.addClass("col-xs-12 col-sm-12 col-md-12 col-lg-4 col-xl-4");

        var newMenuItemCardRightCol = $("<div>");
        newMenuItemCardRightCol.addClass("col-xs-12 col-sm-12 col-md-12 col-lg-8 col-xl-8");

        var newMenuItemCardDescription: cheerio.Cheerio = $("<p>");
        newMenuItemCardDescription.addClass("card-text");
        newMenuItemCardDescription.text(specifiedRestaurantMenuData["Description"]);

        newMenuItemCardLeftCol.append(newMenuItemCardTitle);
        newMenuItemCardLeftCol.append(newMenuItemCardText);

        newMenuItemCardRightCol.append(newMenuItemCardDescription);

        newMenuItemCardRow.append(newMenuItemCardLeftCol);
        newMenuItemCardRow.append(newMenuItemCardRightCol);

        newMenuItemCardBody.append(newMenuItemCardRow);

    }else{
        newMenuItemCardBody.append(newMenuItemCardTitle);
        newMenuItemCardBody.append(newMenuItemCardText);
    }

    newMenuItemCard.append(newMenuItemCardBody);

    return newMenuItemCard;
}

function injectRestaurantData(restaurantData: any, baseTemplate: string): string {
    var $: cheerio.Root = cheerio.load(baseTemplate);

    var restaurantNameElement = $("#kym-restaurant-name");
    var restaurantOpenStatusElement = $("#kym-restaurant-open-status");
    var restaurantAddressElement = $("#kym-restaurant-address");
    var restaurantContactInfoElement = $("#kym-restaurant-contact-info");
    var restaurantCategoriesElement = $("#kym-restaurant-categories");
    var restaurantHoursElement = $("#kym-restaurant-hours");
    var restaurantMenuElement = $("#kym-restaurant-menu");

    var basicRestaurantData = restaurantData[0].queryResults[0];
    var restaurantHoursData = restaurantData[1].queryResults;
    var restaurantMenuData = restaurantData[2].queryResults;
    var restaurantContactInfoData = restaurantData[3].queryResults;
    var restaurantCategoriesData = restaurantData[4].queryResults;

    var pageTitle = $("head title");
    pageTitle.text(basicRestaurantData["restaurant_name"] + " - KYMenus");

    restaurantNameElement.text(basicRestaurantData["restaurant_name"]);

    restaurantOpenStatusElement.text(generateOperatingStatusString(restaurantHoursData));

    restaurantAddressElement = generateAddressInfoCard(restaurantAddressElement, basicRestaurantData);

    restaurantContactInfoElement = generateContactInfoCard(restaurantContactInfoElement, restaurantContactInfoData);

    restaurantCategoriesElement = generateCategoriesCards(restaurantCategoriesElement, restaurantCategoriesData);

    restaurantHoursElement = generateOperatingHoursCards(restaurantHoursElement, restaurantHoursData);

    restaurantMenuElement = generateMenuCard(restaurantMenuElement, restaurantMenuData);

    return $.html();
}

export function generateRestaurantPage(restaurantData: any): {status?: string, error?: string, html?: string} {
    var response: {status?: string, error?: string, html?: string} = {};

    var responseFromBaseTemplatePrep: {baseTemplate?: string, error?: string} = prepareRestaurantInstanceBaseTemplate();

    if (responseFromBaseTemplatePrep.baseTemplate){
        var populatedTemplate: string = injectRestaurantData(restaurantData, responseFromBaseTemplatePrep.baseTemplate);

        if (populatedTemplate){
            response = {
                status: "Success",
                html: populatedTemplate
            }
        }

    }else{
        response = {
            status: "Error",
            error: "Unable to generate base template."
        }
    }

    return response;
}

