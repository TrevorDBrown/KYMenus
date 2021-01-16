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

function convertToPrice(floatValue: number): string{
    return "$" + floatValue.toFixed(2);
}

function convertToPreferredTime(timeString: string): string{
    // Format the string to: MM/DD/YYYY HH:MI:SS AM/PM
    var baseDateTimeString: string = new Date("1/1/2000 " + timeString).toLocaleTimeString("en-us");
    // Remove the seconds from the date/time string and return.
    return baseDateTimeString.substring(baseDateTimeString.length - 6, 0) + baseDateTimeString.substring(baseDateTimeString.length, baseDateTimeString.length - 3);
}

function determineOperatingStatus(restaurantHoursData: any): string {
    var operatingStatusString = "";

    var currentDateTime = new Date();
    var dayOfWeek = currentDateTime.toLocaleDateString("en-us", {weekday: 'long'});

    var entryFound = false;

    restaurantHoursData.forEach((dataElement: any) => {
        if (!entryFound){
            if (dataElement["day_of_week"] == dayOfWeek){
                entryFound = true;

                var startTime = new Date(currentDateTime.getMonth() + "/" + currentDateTime.getDate() + "/" + currentDateTime.getFullYear() + " " + dataElement["OpenTime"]);
                var endTime = new Date(currentDateTime.getMonth() + "/" + currentDateTime.getDate() + "/" + currentDateTime.getFullYear() + " " + dataElement["CloseTime"]);
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

    if (!entryFound){
        operatingStatusString = "Unknown";
    }

    return operatingStatusString;

}

function generateContactInfoCard(restaurantContactInfoElement: cheerio.Cheerio, restaurantContactInfoData: any): cheerio.Cheerio {
    var $: cheerio.Root = cheerio.load("");

    var breakElement = $("<br />");

    restaurantContactInfoData.forEach((contactInfoEntry: any) => {        
        if (contactInfoEntry.category_name.startsWith("Phone")){
            var phoneLink = $("<a>");
            phoneLink.attr("href", "tel:1" + contactInfoEntry.category_value.replaceAll("-", ""));
            phoneLink.text(contactInfoEntry.category_value);
            restaurantContactInfoElement.append(phoneLink);
            restaurantContactInfoElement.append(breakElement.clone());
        }else if (contactInfoEntry.category_name.startsWith("Email")){
            var emailLink = $("<a>");
            emailLink.attr("href", "mailto:" + contactInfoEntry.category_value);
            emailLink.text("Email (" + contactInfoEntry.category_value + ")");
            restaurantContactInfoElement.append(emailLink);
            restaurantContactInfoElement.append(breakElement.clone());
        }else if (contactInfoEntry.category_name.startsWith("Website")){
            var webLink = $("<a>");
            webLink.attr("href", contactInfoEntry.category_value);
            webLink.attr("target", "_blank");
            webLink.text("Website");
            restaurantContactInfoElement.append(webLink);
            restaurantContactInfoElement.append(breakElement.clone());
        }else if (contactInfoEntry.category_name.startsWith("Online Menu")){
            var menuLink = $("<a>");
            menuLink.attr("href", contactInfoEntry.category_value);
            menuLink.attr("target", "_blank");
            menuLink.text("Menu");
            restaurantContactInfoElement.append(menuLink);
            restaurantContactInfoElement.append(breakElement.clone());
        }else if (contactInfoEntry.category_name.startsWith("Online Ordering")){
            var onlineOrderLink = $("<a>");
            onlineOrderLink.attr("href", contactInfoEntry.category_value);
            onlineOrderLink.attr("target", "_blank");
            onlineOrderLink.text("Order Online");
            restaurantContactInfoElement.append(onlineOrderLink);
            restaurantContactInfoElement.append(breakElement.clone());
        }
    });

    return restaurantContactInfoElement;
}

function generateOperatingHoursCards(parentElement: cheerio.Cheerio, operatingHoursData: any): cheerio.Cheerio{
    var $: cheerio.Root = cheerio.load("");

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
        newHoursCardText.text(convertToPreferredTime(dataElement["OpenTime"]) + " - " + convertToPreferredTime(dataElement["CloseTime"]));

        var dayOfWeekCol = newHoursCardCol.clone();
        dayOfWeekCol.append(newHoursCardTitle);

        var hoursCol = newHoursCardCol.clone();
        hoursCol.append(newHoursCardText);

        newHoursCardRow.append(dayOfWeekCol);
        newHoursCardRow.append(hoursCol);

        newHoursCardBody.append(newHoursCardRow);

        newHoursCard.append(newHoursCardBody);

        parentElement.append(newHoursCard);
    });

    return parentElement;
}

function generateMenuCard(restaurantMenuElement: cheerio.Cheerio, restaurantMenuData: any): cheerio.Cheerio {
    var $: cheerio.Root = cheerio.load("");

    var restaurantCategoryElementTemplate: cheerio.Cheerio = $("<div>");
    restaurantCategoryElementTemplate.addClass("card kym-menu-category-card");

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
    newMenuItemCardText.text(convertToPrice(parseFloat(specifiedRestaurantMenuData["Price"])));

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
    var restaurantHoursElement = $("#kym-restaurant-hours");
    var restaurantMenuElement = $("#kym-restaurant-menu");

    var basicRestaurantData = restaurantData[0].queryResults[0];
    var restaurantHoursData = restaurantData[1].queryResults;
    var restaurantMenuData = restaurantData[2].queryResults;
    var restaurantContactInfoData = restaurantData[3].queryResults;

    var pageTitle = $("head title");
    pageTitle.text(basicRestaurantData["restaurant_name"] + " - KYMenus");

    restaurantNameElement.text(basicRestaurantData["restaurant_name"]);

    restaurantOpenStatusElement.text(determineOperatingStatus(restaurantHoursData));

    restaurantAddressElement.append(basicRestaurantData["address"]);
    restaurantAddressElement.append($("<br />"));
    restaurantAddressElement.append(basicRestaurantData["city_name"] + ", " + basicRestaurantData["state_name"] + " " + basicRestaurantData["zip_code"]);

    restaurantContactInfoElement = generateContactInfoCard(restaurantContactInfoElement, restaurantContactInfoData);

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

