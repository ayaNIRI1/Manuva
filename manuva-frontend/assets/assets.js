import happy_store from "./happy_store.webp"
import manuva_logo from "./manuva-logo.png"
import hero_background from "./hero-background.png"
import category_jewelry from "./category-jewelry.png"
import category_pottery from "./category-pottery.png"
import category_textiles from "./category-textiles.png"
import artisan_placeholder from "./artisan-placeholder.png"
import empty_cart from "./empty-cart.png"
import upload_placeholder from "./upload-placeholder.png"
import { ClockFadingIcon, HeadsetIcon, SendIcon } from "lucide-react";

export const assets = {
    manuva_logo, 
    hero_background, 
    category_jewelry, 
    category_pottery, 
    category_textiles,
    artisan_placeholder, 
    empty_cart, 
    upload_placeholder,
    happy_store,
    hero_model_img: category_pottery,
    hero_product_img1: category_jewelry,
    hero_product_img2: category_textiles
}

// Manuva Handmade Categories - Algerian Crafts
export const categories = [
    "الفخار",           // Pottery
    "المنسوجات",        // Textiles
    "النحاس",          // Copper
    "الخزف",           // Ceramics
    "الجلود",          // Leather
    "الحلي",           // Jewelry
    "السلال",          // Baskets
    "الزرابي",         // Carpets
    "الخشب",           // Wood
    "الزجاج"           // Glass
];

export const dummyRatingsData = []


export const dummyStoreData = {}


export const productDummyData = [];

export const ourSpecsData = [
    { title: "توصيل مجاني", description: "توصيل سريع ومجاني لجميع الطلبات داخل الوطن", icon: SendIcon, accent: '#BD8E89' }, // Mauve
    { title: "إرجاع سهل خلال 7 أيام", description: "غيرت رأيك؟ لا مشكلة. يمكنك إرجاع المنتج خلال 7 أيام", icon: ClockFadingIcon, accent: '#E5C5C1' }, // Pink
    { title: "دعم 24/7", description: "نحن هنا لمساعدتك في أي وقت مع خدمة عملاء احترافية", icon: HeadsetIcon, accent: '#0E1627' } // Navy
]

export const addressDummyData = {}




export const dummyUserData = {}


export const orderDummyData = []


export const storesDummyData = []


export const dummyAdminDashboardData = {
    "orders": 0,
    "stores": 0,
    "products": 0,
    "revenue": "0",
    "allOrders": []
}

export const dummyStoreDashboardData = {
    "ratings": [],
    "totalOrders": 0,
    "totalEarnings": 0,
    "totalProducts": 0
}
