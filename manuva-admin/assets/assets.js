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

export const dummyRatingsData = [
    { id: "rat_1", rating: 4.8, review: "منتج رائع جدا، صناعة يدوية متقنة بجودة عالية. التفاصيل جميلة والألوان طبيعية. أنصح بشدة بالشراء من هذا الحرفي الماهر.", user: { name: 'أمينة بن علي', image: artisan_placeholder }, productId: "prod_1", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'إبريق نحاس تقليدي', category:'النحاس', id:'prod_1'} },
    { id: "rat_2", rating: 5.0, review: "ماشاء الله، القطعة وصلت بحالة ممتازة. الصنعة احترافية والسعر معقول جدا. شكرا للحرفي على هذا العمل الرائع!", user: { name: 'كريم مزياني', image: artisan_placeholder }, productId: "prod_2", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'سلة خزف تقليدية', category:'الفخار', id:'prod_2'} },
    { id: "rat_3", rating: 4.5, review: "منتج جميل ومميز، الخامات طبيعية والألوان زاهية. استلمتها في الوقت المحدد. سعيدة جدا بالشراء.", user: { name: 'نسرين حمادي', image: artisan_placeholder }, productId: "prod_3", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'زربية صوفية', category:'الزرابي', id:'prod_3'} },
    { id: "rat_4", rating: 5.0, review: "قطعة فنية حقيقية! الصناعة اليدوية واضحة في كل التفاصيل. سأطلب المزيد قريبا.", user: { name: 'سامي بوعلام', image: artisan_placeholder }, productId: "prod_4", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'حقيبة جلدية', category:'الجلود', id:'prod_4'} },
    { id: "rat_5", rating: 4.7, review: "منتج ممتاز بجودة عالية. التعامل مع البائع كان محترم والتسليم سريع. أنصح بالتجربة.", user: { name: 'ليلى قاسمي', image: artisan_placeholder }, productId: "prod_5", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'صحن خزفي مزخرف', category:'الخزف', id:'prod_5'} },
    { id: "rat_6", rating: 5.0, review: "تحفة فنية بكل المقاييس! اللمسة اليدوية واضحة والسعر مناسب. شكرا Manuva على هذه المنصة الرائعة.", user: { name: 'رشيد بلقاسم', image: artisan_placeholder }, productId: "prod_6", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'سوار فضي تقليدي', category:'الحلي', id:'prod_6'} },
]

export const dummyStoreData = {
    id: "store_1",
    userId: "user_1",
    name: "ورشة الأصالة",
    description: "نحن ورشة الأصالة، متخصصون في صناعة المنتجات اليدوية التقليدية بلمسة عصرية. نؤمن بالحفاظ على التراث الجزائري من خلال منتجات فريدة صنعت بحب وإتقان.",
    username: "assala_workshop",
    address: "حي القصبة، الجزائر العاصمة، الجزائر",
    status: "approved",
    isActive: true,
    logo: happy_store,
    email: "assala.workshop@example.com",
    contact: "+213 555 123 456",
    createdAt: "2025-09-04T09:04:16.189Z",
    updatedAt: "2025-09-04T09:04:44.273Z",
    user: {
        id: "user_31dOriXqC4TATvc0brIhlYbwwc5",
        name: "محمد الحرفي",
        email: "mohamed.artisan@example.com",
        image: manuva_logo,
    }
}

export const productDummyData = [
    {
        id: "prod_1",
        name: "إبريق نحاس تقليدي مزخرف",
        description: "إبريق نحاسي تقليدي مصنوع يدويا بحرفية عالية. يتميز بزخارف إسلامية أصيلة ونقوش دقيقة. مثالي للاستخدام اليومي أو كقطعة ديكور تراثية. صنع من النحاس الخالص على يد حرفيين ماهرين من القصبة العتيقة.",
        mrp: 8000,
        price: 6500,
        images: [category_jewelry, category_pottery, category_textiles, hero_background],
        category: "النحاس",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_2",
        name: "فازة فخارية مرسومة يدويا",
        description: "فازة فخارية جميلة مصنوعة بالطرق التقليدية ومزينة برسومات يدوية بألوان طبيعية. قطعة فريدة من نوعها.",
        mrp: 4500,
        price: 3800,
        images: [category_pottery],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "الفخار",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 28 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 28 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_3",
        name: "زربية صوفية بربرية",
        description: "زربية تقليدية منسوجة يدويا من الصوف الطبيعي بألوان زاهية. تصميم بربري أصيل يضيف لمسة دفء لمنزلك.",
        mrp: 25000,
        price: 22000,
        images: [category_textiles],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "الزرابي",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 27 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 27 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_4",
        name: "حقيبة جلدية تقليدية",
        description: "حقيبة جلدية مصنوعة من الجلد الطبيعي بحرفية عالية. تصميم عصري يمزج بين الأصالة والحداثة.",
        mrp: 12000,
        price: 9500,
        images: [hero_background],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "الجلود",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 26 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 26 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_5",
        name: "صحن خزفي بزخارف تقليدية",
        description: "صحن خزفي جميل مزين بزخارف تقليدية وألوان زاهية. صنع يدويا بإتقان ويمكن استخدامه أو عرضه كقطعة ديكور.",
        mrp: 3500,
        price: 2800,
        images: [category_pottery],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "الخزف",
        rating: [...dummyRatingsData,...dummyRatingsData],
        createdAt: 'Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_6",
        name: "سوار فضي بنقوش أمازيغية",
        description: "سوار فضي أصلي منقوش برموز أمازيغية تقليدية. صياغة يدوية دقيقة ومميزة.",
        mrp: 8500,
        price: 7200,
        images: [category_jewelry],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "الحلي",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 24 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 24 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_7",
        name: "سلة خوص تقليدية",
        description: "سلة منسوجة يدويا من الخوص الطبيعي. مثالية للاستخدام المنزلي أو كقطعة ديكور.",
        mrp: 4000,
        price: 3200,
        images: [category_textiles],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "السلال",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 23 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 23 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_8",
        name: "قلادة فضية بحجر تركواز",
        description: "قلادة فضية أنيقة مزينة بحجر تركواز طبيعي. تصميم فريد وصياغة احترافية.",
        mrp: 9500,
        price: 8000,
        images: [category_jewelry],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "الحلي",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 22 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 22 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_9",
        name: "إطار مرآة خشبي منقوش",
        description: "إطار مرآة خشبي مزخرف بنقوش يدوية تقليدية. قطعة فنية لمنزلك.",
        mrp: 6500,
        price: 5500,
        images: [hero_background],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "الخشب",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 21 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 21 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_10",
        name: "طقم فناجين قهوة فخارية",
        description: "طقم من 6 فناجين قهوة فخارية مصنوعة ومزينة يدويا. مثالية لضيافة أصيلة.",
        mrp: 7000,
        price: 5800,
        images: [category_pottery],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "الفخار",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 20 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 20 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_11",
        name: "وشاح صوفي منسوج يدويا",
        description: "وشاح صوفي دافئ منسوج بالطرق التقليدية بألوان جميلة.",
        mrp: 5500,
        price: 4500,
        images: [category_textiles],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "المنسوجات",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_12",
        name: "صندوق خشبي مزخرف",
        description: "صندوق خشبي صغير مزين بزخارف تقليدية. مثالي لحفظ المجوهرات.",
        mrp: 4500,
        price: 3800,
        images: [hero_background],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "الخشب",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 18 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 18 2025 14:51:25 GMT+0530 (India Standard Time)',
    }
];

export const ourSpecsData = [
    { title: "توصيل مجاني", description: "توصيل سريع ومجاني لجميع الطلبات داخل الوطن", icon: SendIcon, accent: '#BD8E89' }, // Mauve
    { title: "إرجاع سهل خلال 7 أيام", description: "غيرت رأيك؟ لا مشكلة. يمكنك إرجاع المنتج خلال 7 أيام", icon: ClockFadingIcon, accent: '#E5C5C1' }, // Pink
    { title: "دعم 24/7", description: "نحن هنا لمساعدتك في أي وقت مع خدمة عملاء احترافية", icon: HeadsetIcon, accent: '#0E1627' } // Navy
]

export const addressDummyData = {
    id: "addr_1",
    userId: "user_1",
    name: "أحمد بن محمد",
    email: "ahmed@example.com",
    street: "123 شارع ديدوش مراد",
    city: "الجزائر",
    state: "الجزائر العاصمة",
    zip: "16000",
    country: "الجزائر",
    phone: "+213 555 123 456",
    createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
}

export const couponDummyData = [
    { code: "NEW20", description: "خصم 20% للمستخدمين الجدد", discount: 20, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:31.183Z" },
    { code: "NEW10", description: "خصم 10% للمستخدمين الجدد", discount: 10, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:50.653Z" },
    { code: "OFF20", description: "خصم 20% لجميع المستخدمين", discount: 20, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:00.811Z" },
    { code: "OFF10", description: "خصم 10% لجميع المستخدمين", discount: 10, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:21.279Z" },
    { code: "PLUS10", description: "خصم 10% للأعضاء", discount: 10, forNewUser: false, forMember: true, isPublic: false, expiresAt: "2027-03-06T00:00:00.000Z", createdAt: "2025-08-22T11:38:20.194Z" }
]

export const dummyUserData = {
    id: "user_31dQbH27HVtovbs13X2cmqefddM",
    name: "محمد الحرفي",
    email: "artisan@example.com",
    image: manuva_logo,
    cart: {}
}

export const orderDummyData = [
    {
        id: "cmemm75h5001jtat89016h1p3",
        total: 9300,
        status: "DELIVERED",
        userId: "user_31dQbH27HVtovbs13X2cmqefddM",
        storeId: "cmemkqnzm000htat8u7n8cpte",
        addressId: "cmemm6g95001ftat8omv9b883",
        isPaid: false,
        paymentMethod: "COD",
        createdAt: "2025-08-22T09:15:03.929Z",
        updatedAt: "2025-08-22T09:15:50.723Z",
        isCouponUsed: true,
        coupon: dummyRatingsData[2],
        orderItems: [
            { orderId: "cmemm75h5001jtat89016h1p3", productId: "cmemlydnx0017tat8h3rg92hz", quantity: 1, price: 6500, product: productDummyData[0], },
            { orderId: "cmemm75h5001jtat89016h1p3", productId: "cmemlxgnk0015tat84qm8si5v", quantity: 1, price: 2800, product: productDummyData[4], }
        ],
        address: addressDummyData,
        user: dummyUserData
    },
    {
        id: "cmemm6jv7001htat8vmm3gxaf",
        total: 39200,
        status: "DELIVERED",
        userId: "user_31dQbH27HVtovbs13X2cmqefddM",
        storeId: "cmemkqnzm000htat8u7n8cpte",
        addressId: "cmemm6g95001ftat8omv9b883",
        isPaid: false,
        paymentMethod: "COD",
        createdAt: "2025-08-22T09:14:35.923Z",
        updatedAt: "2025-08-22T09:15:52.535Z",
        isCouponUsed: true,
        coupon: couponDummyData[0],
        orderItems: [
            { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "cmemm1f3y001dtat8liccisar", quantity: 1, price: 22000, product: productDummyData[2], },
            { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "cmemm0nh2001btat8glfvhry1", quantity: 1, price: 9500, product: productDummyData[3], },
            { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "cmemlz8640019tat8kz7emqca", quantity: 1, price: 7200, product: productDummyData[5], }
        ],
        address: addressDummyData,
        user: dummyUserData
    }
]

export const storesDummyData = [
    {
        id: "cmemkb98v0001tat8r1hiyxhn",
        userId: "user_31dOriXqC4TATvc0brIhlYbwwc5",
        name: "ورشة الأصالة",
        description: "متخصصون في صناعة المنتجات اليدوية التقليدية بلمسة عصرية. نحافظ على التراث الجزائري من خلال منتجات فريدة.",
        username: "assala_workshop",
        address: "حي القصبة، الجزائر العاصمة، الجزائر",
        status: "approved",
        isActive: true,
        logo: manuva_logo,
        email: "assala@example.com",
        contact: "+213 555 123 456",
        createdAt: "2025-08-22T08:22:16.189Z",
        updatedAt: "2025-08-22T08:22:44.273Z",
        user: dummyUserData,
    },
    {
        id: "cmemkqnzm000htat8u7n8cpte",
        userId: "user_31dQbH27HVtovbs13X2cmqefddM",
        name: "ورشة التراث",
        description: "في ورشة التراث، نؤمن بأن كل منتج يحكي قصة. نقدم أجود المنتجات الحرفية الجزائرية الأصيلة.",
        username: "heritage_workshop",
        address: "حي باب الوادي، الجزائر العاصمة، الجزائر",
        status: "approved",
        isActive: true,
        logo: happy_store,
        email: "heritage@example.com",
        contact: "+213 555 789 012",
        createdAt: "2025-08-22T08:34:15.155Z",
        updatedAt: "2025-08-22T08:34:47.162Z",
        user: dummyUserData,
    }
]

export const dummyAdminDashboardData = {
    "orders": 6,
    "stores": 2,
    "products": 12,
    "revenue": "48500",
    "allOrders": [
        { "createdAt": "2025-08-20T08:46:58.239Z", "total": 6500 },
        { "createdAt": "2025-08-22T08:46:21.818Z", "total": 3800 },
        { "createdAt": "2025-08-22T08:45:59.587Z", "total": 2800 },
        { "createdAt": "2025-08-23T09:15:03.929Z", "total": 9300 },
        { "createdAt": "2025-08-23T09:14:35.923Z", "total": 39200 },
        { "createdAt": "2025-08-23T11:44:29.713Z", "total": 2000 },
        { "createdAt": "2025-08-24T09:15:03.929Z", "total": 13000 },
        { "createdAt": "2025-08-24T09:14:35.923Z", "total": 5000 },
        { "createdAt": "2025-08-24T11:44:29.713Z", "total": 4500 },
        { "createdAt": "2025-08-24T11:56:29.713Z", "total": 3200 },
        { "createdAt": "2025-08-25T11:44:29.713Z", "total": 7500 },
        { "createdAt": "2025-08-25T09:15:03.929Z", "total": 22000 },
        { "createdAt": "2025-08-25T09:14:35.923Z", "total": 7200 },
        { "createdAt": "2025-08-25T11:44:29.713Z", "total": 2000 },
        { "createdAt": "2025-08-25T11:56:29.713Z", "total": 3200 },
        { "createdAt": "2025-08-25T11:30:29.713Z", "total": 9500 }
    ]
}

export const dummyStoreDashboardData = {
    "ratings": dummyRatingsData,
    "totalOrders": 2,
    "totalEarnings": 48500,
    "totalProducts": 12
}
