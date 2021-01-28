/*
    KYMenus
    (c)2020-2021 Trevor D. Brown. All rights reserved.
    
    general-types.ts - the interfaces and types used within the service for general purposes.
*/

export interface Restaurant {
    restaurantName: string,
    restaurantPublicID: string,
    address: string,
    city: string,
    state: string,
    zip: string,
    hours?: RestaurantHours[],
    menus?: RestaurantMenu[],
    extendedDetails?: RestaurantExtendedDetails[],
    categories?: RestaurantCategory[]
}

export interface RestaurantMenu {
    menuID: number,
    menuName: string,
    menuCategory: string,
    menuItems?: RestaurantMenuItem[]
}

export interface RestaurantMenuItem {
    menuItemID: number,
    menuItemName: string,
    menuItemCategory: string,
    menuItemPrice: number,
    menuItemUnit: string,
    menuItemDescription?: string,
    menuItemQuantity?: number
}

export interface RestaurantHours {
    hoursID: number,
    dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday",
    startTime: Date,
    endTime: Date,
    operatingStatus: "Open" | "Closed",
    specialHours: boolean
}

export interface RestaurantExtendedDetails {
    detailID: number,
    detailCategory: string,
    displayPriority?: number,
    displayText?: string,
    detailValue: string
}

export interface RestaurantCategory {
    categoryID: number,
    categoryName: string,
    displayCategory: boolean
}