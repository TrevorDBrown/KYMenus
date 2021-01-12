/*
    KYMenus
    (c)2020-2021 Trevor D. Brown. All rights reserved.
    
    ui.ts - component for UI assembly.
*/

import * as cheerio from 'cheerio';
import * as path from 'path';
import * as fs from 'fs';

function prepareBaseTemplate(): {baseTemplate?: string, error?: string} {
    var response: {baseTemplate?: string, error?: string} = {};

    var baseTemplate: Buffer = fs.readFileSync(path.join(__dirname, './../../support/ui/restaurant-template.html'));

    if (baseTemplate){
        response = {baseTemplate: baseTemplate.toString()};
    }else{
        response = {error: "File not found."};
    }

    return response;

}

function injectRestaurantData(restaurantData: any, baseTemplate: string): string {
    var $: cheerio.Root = cheerio.load(baseTemplate);

    var restaurantNameElement = $("#kym-restaurant-name");

    // TODO: implement construction from restaurant-instance.js into this function (primarily data population and elemental constructs)

    return $.html();
}

export function generateRestaurantPage(restaurantData: any): {status?: string, error?: string, html?: string} {
    var response: {status?: string, error?: string, html?: string} = {};

    var responseFromBaseTemplatePrep: {baseTemplate?: string, error?: string} = prepareBaseTemplate();

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

