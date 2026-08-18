import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});
import userModel from "../models/user.model.js";
import sellerModel from "../models/seller.model.js";
import productModel from "../models/product.model.js";

const MONGO_URI = process.env.MONGO_URI;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

const SELLER_1_EMAIL = process.env.SELLER_1_EMAIL;
const SELLER_2_EMAIL = process.env.SELLER_2_EMAIL;


// ======================================================
// VALIDATE ENV
// ======================================================

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI is missing in .env");
}

if (!PEXELS_API_KEY) {
  throw new Error("❌ PEXELS_API_KEY is missing in .env");
}

if (!SELLER_1_EMAIL || !SELLER_2_EMAIL) {
  throw new Error(
    "❌ SELLER_1_EMAIL or SELLER_2_EMAIL is missing in .env"
  );
}


// ======================================================
// PRODUCT DISTRIBUTION
// ======================================================

const CATEGORY_COUNTS = {
  "T-Shirts": 70,
  "Shirts": 70,
  "Jeans": 70,
  "Trousers": 50,
  "Jackets": 50,
  "Blazers": 50,
  "Hoodies": 50,
  "Shoes": 50,
  "Sunglasses": 50,
  "Perfumes": 50,
};


// ======================================================
// IMAGE SEARCH TERMS
// ======================================================

const SEARCH_TERMS = {
  "T-Shirts": [
    "men t shirt fashion",
    "men casual t shirt",
    "men polo t shirt",
    "men streetwear t shirt",
  ],

  "Shirts": [
    "men casual shirt fashion",
    "men formal shirt fashion",
    "men linen shirt",
    "men shirt outfit",
  ],

  "Jeans": [
    "men jeans fashion",
    "men denim jeans",
    "men blue jeans fashion",
    "men black jeans",
  ],

  "Trousers": [
    "men trousers fashion",
    "men pants fashion",
    "men formal trousers",
    "men casual trousers",
  ],

  "Jackets": [
    "men jacket fashion",
    "men casual jacket",
    "men denim jacket",
    "men bomber jacket",
  ],

  "Blazers": [
    "men blazer fashion",
    "men formal blazer",
    "men black blazer",
    "men suit blazer",
  ],

  "Hoodies": [
    "men hoodie fashion",
    "men casual hoodie",
    "men streetwear hoodie",
    "men sweatshirt",
  ],

  "Shoes": [
    "men sneakers fashion",
    "men casual shoes",
    "men footwear fashion",
    "men shoes outfit",
  ],

  "Sunglasses": [
    "men sunglasses fashion",
    "men stylish sunglasses",
    "mens eyewear fashion",
    "men sunglasses outfit",
  ],

  "Perfumes": [
    "men perfume bottle",
    "mens fragrance",
    "luxury men perfume",
    "men perfume product",
  ],
};


// ======================================================
// PRODUCT NAME POOLS
// ======================================================

const PRODUCT_NAMES = {
  "T-Shirts": [
    "Classic Cotton T-Shirt",
    "Premium Regular Fit T-Shirt",
    "Oversized Streetwear T-Shirt",
    "Essential Polo T-Shirt",
    "Urban Casual T-Shirt",
    "Premium Solid T-Shirt",
    "Everyday Comfort T-Shirt",
    "Minimal Cotton T-Shirt",
  ],

  "Shirts": [
    "Premium Casual Shirt",
    "Classic Oxford Shirt",
    "Slim Fit Casual Shirt",
    "Premium Linen Shirt",
    "Classic Formal Shirt",
    "Urban Checked Shirt",
    "Textured Casual Shirt",
    "Essential Full Sleeve Shirt",
  ],

  "Jeans": [
    "Slim Fit Denim Jeans",
    "Classic Blue Jeans",
    "Regular Fit Jeans",
    "Dark Wash Denim Jeans",
    "Urban Stretch Jeans",
    "Premium Black Jeans",
    "Straight Fit Denim",
    "Comfort Stretch Jeans",
  ],

  "Trousers": [
    "Classic Formal Trousers",
    "Slim Fit Trousers",
    "Relaxed Fit Pants",
    "Premium Cotton Trousers",
    "Smart Casual Pants",
    "Stretch Formal Trousers",
  ],

  "Jackets": [
    "Classic Denim Jacket",
    "Urban Bomber Jacket",
    "Premium Casual Jacket",
    "Lightweight Everyday Jacket",
    "Classic Biker Jacket",
    "Minimal Harrington Jacket",
  ],

  "Blazers": [
    "Classic Black Blazer",
    "Premium Slim Fit Blazer",
    "Modern Formal Blazer",
    "Textured Party Blazer",
    "Classic Navy Blazer",
    "Smart Casual Blazer",
  ],

  "Hoodies": [
    "Premium Cotton Hoodie",
    "Classic Pullover Hoodie",
    "Urban Oversized Hoodie",
    "Minimal Essential Hoodie",
    "Streetwear Hoodie",
    "Everyday Comfort Hoodie",
  ],

  "Shoes": [
    "Classic Casual Sneakers",
    "Urban Lifestyle Sneakers",
    "Premium Everyday Shoes",
    "Minimal White Sneakers",
    "Classic Formal Shoes",
    "Modern Running Sneakers",
  ],

  "Sunglasses": [
    "Classic Black Sunglasses",
    "Urban Square Sunglasses",
    "Premium Aviator Sunglasses",
    "Modern Round Sunglasses",
    "Classic Wayfarer Sunglasses",
  ],

  "Perfumes": [
    "Urban Eau De Parfum",
    "Classic Men's Fragrance",
    "Premium Woody Perfume",
    "Fresh Citrus Fragrance",
    "Midnight Men's Perfume",
    "Luxury Signature Fragrance",
  ],
};


// ======================================================
// COLORS
// ======================================================

const COLORS = [
  "Black",
  "White",
  "Navy Blue",
  "Grey",
  "Olive",
  "Beige",
  "Maroon",
  "Brown",
  "Sky Blue",
  "Dark Green",
];


// ======================================================
// HELPERS
// ======================================================

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}


// ======================================================
// PRICE
// ======================================================

function generatePrice(category) {
  let amount;

  switch (category) {
    case "T-Shirts":
      amount = randomNumber(399, 1299);
      break;

    case "Shirts":
      amount = randomNumber(599, 1799);
      break;

    case "Jeans":
      amount = randomNumber(899, 2499);
      break;

    case "Trousers":
      amount = randomNumber(699, 1999);
      break;

    case "Jackets":
      amount = randomNumber(1199, 2999);
      break;

    case "Blazers":
      amount = randomNumber(1499, 3999);
      break;

    case "Hoodies":
      amount = randomNumber(799, 1999);
      break;

    case "Shoes":
      amount = randomNumber(999, 2999);
      break;

    case "Sunglasses":
      amount = randomNumber(499, 1999);
      break;

    case "Perfumes":
      amount = randomNumber(699, 2499);
      break;

    default:
      amount = randomNumber(499, 1999);
  }

  return Math.round(amount / 10) * 10;
}


// ======================================================
// SHIPPING
// ======================================================

function generateShipping(category) {
  const shipping = {
    "T-Shirts": {
      weight: 0.3,
      dimensions: {
        length: 30,
        width: 25,
        height: 5,
      },
    },

    "Shirts": {
      weight: 0.4,
      dimensions: {
        length: 32,
        width: 25,
        height: 5,
      },
    },

    "Jeans": {
      weight: 0.7,
      dimensions: {
        length: 35,
        width: 28,
        height: 7,
      },
    },

    "Trousers": {
      weight: 0.6,
      dimensions: {
        length: 35,
        width: 28,
        height: 6,
      },
    },

    "Jackets": {
      weight: 0.9,
      dimensions: {
        length: 40,
        width: 32,
        height: 10,
      },
    },

    "Blazers": {
      weight: 1.1,
      dimensions: {
        length: 45,
        width: 35,
        height: 12,
      },
    },

    "Hoodies": {
      weight: 0.8,
      dimensions: {
        length: 40,
        width: 32,
        height: 10,
      },
    },

    "Shoes": {
      weight: 1.0,
      dimensions: {
        length: 35,
        width: 22,
        height: 14,
      },
    },

    "Sunglasses": {
      weight: 0.2,
      dimensions: {
        length: 18,
        width: 8,
        height: 6,
      },
    },

    "Perfumes": {
      weight: 0.4,
      dimensions: {
        length: 18,
        width: 10,
        height: 8,
      },
    },
  };

  return shipping[category];
}


// ======================================================
// PEXELS SEARCH
// ======================================================

async function searchPexelsImages(query) {
  const url =
    `https://api.pexels.com/v1/search` +
    `?query=${encodeURIComponent(query)}` +
    `&per_page=80` +
    `&orientation=portrait` +
    `&size=large`;

  const response = await fetch(url, {
    headers: {
      Authorization: PEXELS_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Pexels API error ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  return data.photos
    .filter(
      (photo) =>
        photo?.id &&
        photo?.src?.large2x
    )
    .map((photo) => ({
      id: photo.id,
      url: photo.src.large2x,
      pexelsUrl: photo.url,
      photographer: photo.photographer,
    }));
}


// ======================================================
// BUILD IMAGE POOL
// ======================================================

async function buildImagePool() {
  const imagePool = {};

  for (const category of Object.keys(CATEGORY_COUNTS)) {
    console.log(`\n📸 Fetching ${category} images...`);

    const allImages = [];

    for (const query of SEARCH_TERMS[category]) {
      console.log(`   → ${query}`);

      const images = await searchPexelsImages(query);

      allImages.push(...images);
    }

    // Remove duplicate Pexels photos
    const uniqueImages = [
      ...new Map(
        allImages.map((image) => [
          image.id,
          image,
        ])
      ).values(),
    ];

    if (uniqueImages.length < 3) {
      throw new Error(
        `Not enough images found for ${category}`
      );
    }

    imagePool[category] = uniqueImages;

    console.log(
      `   ✅ ${uniqueImages.length} unique images`
    );
  }

  return imagePool;
}


// ======================================================
// GET 3 DIFFERENT IMAGES
// ======================================================

function getThreeImages(imagePool) {
  const selected = [];

  while (selected.length < 3) {
    const image = randomItem(imagePool);

    const alreadySelected = selected.some(
      (item) => item.id === image.id
    );

    if (!alreadySelected) {
      selected.push(image);
    }
  }

  return selected;
}


// ======================================================
// CREATE PRODUCT
// ======================================================

function createProduct(
  category,
  index,
  sellerId,
  imagePool
) {
  const productName =
    randomItem(PRODUCT_NAMES[category]);

  const color =
    randomItem(COLORS);

  let size;

  if (category === "Shoes") {
    size = randomItem([
      "7",
      "8",
      "9",
      "10",
      "11",
    ]);
  } else if (
    category === "Sunglasses" ||
    category === "Perfumes"
  ) {
    size = "Free Size";
  } else {
    size = randomItem([
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ]);
  }

  const priceAmount =
    generatePrice(category);

  const shipping =
    generateShipping(category);

const selectedImages =
  getThreeImages(imagePool[category]);
  
  const variantImages =
    selectedImages.map((image) => ({
      url: image.url,
    }));

  const price = {
    amount: priceAmount,
    currency: "INR",
  };

  const sku =
    `ZRIVE-${slugify(category)
      .substring(0, 4)
      .toUpperCase()}-${String(index).padStart(
        4,
        "0"
      )}`;

  const stock =
    randomNumber(5, 45);

  return {
    title: `${productName} - ${color}`,

    description:
      `Premium ${category.toLowerCase()} designed ` +
      `for modern men's everyday style. Comfortable ` +
      `fit, versatile design and an easy-to-style look.`,

    seller: sellerId,

    price,

    // status is explicitly set because we are using insertMany
    status:
      stock > 0
        ? "In-Stock"
        : "Out of Stock",

    category,

    // Product-level image = first variant image
    images: [
      {
        url: variantImages[0].url,
      },
    ],

    shippingDefaults: {
      weight: shipping.weight,

      dimensions: {
        length: shipping.dimensions.length,
        width: shipping.dimensions.width,
        height: shipping.dimensions.height,
      },
    },

    variants: [
      {
        size,
        color,
        sku,
        stock,

        price: {
          amount: priceAmount,
          currency: "INR",
        },

        // Exactly 3 images
        images: variantImages,

        weight: shipping.weight,

        dimensions: {
          length: shipping.dimensions.length,
          width: shipping.dimensions.width,
          height: shipping.dimensions.height,
        },
      },
    ],
  };
}


// ======================================================
// MAIN SEED FUNCTION
// ======================================================

async function seedProducts() {
  try {
    console.log("\n================================");
    console.log("      ZRIVE PRODUCT SEED");
    console.log("================================\n");

    // -----------------------------------------------
    // CONNECT
    // -----------------------------------------------

    console.log("🔌 Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB connected\n");


    // -----------------------------------------------
    // FIND USERS
    // -----------------------------------------------

    console.log("👤 Finding sellers...");

    const seller1 = await userModel.findOne({
      email: SELLER_1_EMAIL,
    });

    const seller2 = await userModel.findOne({
      email: SELLER_2_EMAIL,
    });


    if (!seller1) {
      throw new Error(
        `Seller 1 user not found: ${SELLER_1_EMAIL}`
      );
    }

    if (!seller2) {
      throw new Error(
        `Seller 2 user not found: ${SELLER_2_EMAIL}`
      );
    }


    // -----------------------------------------------
    // CHECK ROLES
    // -----------------------------------------------

    const validRoles = [
      "seller",
      "basic_seller",
    ];

    if (!validRoles.includes(seller1.role)) {
      throw new Error(
        `${SELLER_1_EMAIL} is not a seller. Role: ${seller1.role}`
      );
    }

    if (!validRoles.includes(seller2.role)) {
      throw new Error(
        `${SELLER_2_EMAIL} is not a seller. Role: ${seller2.role}`
      );
    }


    console.log(
      `✅ Seller 1: ${seller1.email}`
    );

    console.log(
      `   User ID: ${seller1._id}`
    );

    console.log(
      `✅ Seller 2: ${seller2.email}`
    );

    console.log(
      `   User ID: ${seller2._id}`
    );


    // -----------------------------------------------
    // CHECK SELLER PROFILES
    // -----------------------------------------------

    console.log(
      "\n🏪 Checking seller profiles..."
    );

    const sellerProfile1 =
      await sellerModel.findOne({
        userId: seller1._id,
      });

    const sellerProfile2 =
      await sellerModel.findOne({
        userId: seller2._id,
      });


    if (!sellerProfile1) {
      throw new Error(
        `Seller profile does not exist for ${seller1.email}`
      );
    }

    if (!sellerProfile2) {
      throw new Error(
        `Seller profile does not exist for ${seller2.email}`
      );
    }


    console.log(
      "✅ Both seller profiles found"
    );


    // -----------------------------------------------
    // FETCH IMAGES
    // -----------------------------------------------

    const imagePool =
      await buildImagePool();


    // -----------------------------------------------
    // GENERATE PRODUCTS
    // -----------------------------------------------

    console.log(
      "\n🛍️ Generating products..."
    );

    const products = [];

    let globalIndex = 1;


    for (
      const [category, count]
      of Object.entries(CATEGORY_COUNTS)
    ) {

      console.log(
        `   ${category}: ${count}`
      );

      for (
        let i = 0;
        i < count;
        i++
      ) {

        // 50 / 50 seller profile distribution
        const sellerProfileId =
          globalIndex % 2 === 0
            ? sellerProfile1._id
            : sellerProfile2._id;

        products.push(
          createProduct(
            category,
            globalIndex,
            sellerProfileId,
            imagePool
          )
        );

        globalIndex++;
      }
    }


    console.log(
      `\n📦 Total products: ${products.length}`
    );


    // -----------------------------------------------
    // INSERT
    // -----------------------------------------------

    console.log(
      "\n💾 Inserting products into MongoDB..."
    );

    const inserted =
      await productModel.insertMany(
        products,
        {
          ordered: true,
        }
      );


    // -----------------------------------------------
    // COUNTS
    // -----------------------------------------------

    const seller1Count =
      inserted.filter(
        (product) =>
          product.seller.toString() ===
          seller1._id.toString()
      ).length;

    const seller2Count =
      inserted.filter(
        (product) =>
          product.seller.toString() ===
          seller2._id.toString()
      ).length;


    // -----------------------------------------------
    // COMPLETE
    // -----------------------------------------------

    console.log(
      "\n================================"
    );

    console.log(
      "       ✅ SEED COMPLETE"
    );

    console.log(
      "================================"
    );

    console.log(
      `Total products : ${inserted.length}`
    );

    console.log(
      `Seller 1       : ${seller1Count}`
    );

    console.log(
      `Seller 2       : ${seller2Count}`
    );

    console.log(
      "\nCategory distribution:"
    );

    for (
      const [category, count]
      of Object.entries(CATEGORY_COUNTS)
    ) {
      console.log(
        `  ${category.padEnd(14)} ${count}`
      );
    }

    console.log(
      "\n================================\n"
    );

  } catch (error) {

    console.error(
      "\n❌ SEED FAILED\n"
    );

    console.error(
      error.message
    );

  } finally {

    await mongoose.disconnect();

    console.log(
      "🔌 MongoDB disconnected."
    );
  }
}


// ======================================================
// RUN
// ======================================================

seedProducts();