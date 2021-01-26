/*
    KYMenus
    (c)2020-2021 Trevor D. Brown. All rights reserved.
    
    geolocation.ts - an interface to a third-party geolocation service.
    Note:   by segregating this functionality, other services may be drop-in replacements to
            the service being used during development (LocationIQ).

*/

import * as https from 'https';

function getZIPFromReverseGeocodingAPI(latitude: string, longitude: string, callback: (zipCode: string) => void): void {
    // TODO: retrieve apiKey from config.json file.
    var apiKey: string = "";
    var zipCode: string = "";
    
    var options: any = {
        hostname: 'us1.locationiq.com',
        port: 443,
        path: `/v1/reverse.php?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`
    }

    var req = https.get(options, (res) => {
        if (res.statusCode == 200){
            var data: string = "";

            res.on("data", (dataChunk) => {
                data += dataChunk;
            });
    
            res.on("end", () => {
                // Only concerned with ZIP code. Other data can be pulled, if necessary.
                zipCode = JSON.parse(data)["address"]["postcode"];
                return callback(zipCode);
            });

        }else {
            // TODO: better error handling here.
            console.log(res.statusCode);
            return callback("");
        }


    }).on("error", (error) => {
        // TODO: better error handling here.
        console.error(error);
        return callback(error.message);
    });
}

export function convertGeolocationToZIP(latitude: string, longitude: string, callback: (zipCode: string) => void): void {
    getZIPFromReverseGeocodingAPI(latitude, longitude, (zipCode: string) => {
        if (zipCode){
            return callback(zipCode);
        }else{
            return callback("Error");
        }
    });
}