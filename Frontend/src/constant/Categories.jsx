// Category definitions shared across navigation, filter chips, and category tiles
export const CATEGORIES = [
  {
    id: "tshirts",
    label: "T-Shirts",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=580&auto=format&fit=crop",
  },
  {
    id: "shirts",
    label: "Shirts",
    image:
      "https://images.unsplash.com/photo-1618786177957-29d9b6b26d8a?w=600&auto=format&fit=crop",
  },
  {
    id: "jeans",
    label: "Jeans",
    image:
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&auto=format&fit=crop",
  },
  {
    id: "trousers",
    label: "Trousers",
    image:
      "https://images.unsplash.com/photo-1580906853305-5702e648164e?w=600&auto=format&fit=crop",
  },
  {
    id: "jackets",
    label: "Jackets",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=435&auto=format&fit=crop",
  },
  {
    id: "hoodies",
    label: "Hoodies",
    image:
      "https://images.unsplash.com/photo-1680292783974-a9a336c10366?w=600&auto=format&fit=crop",
  },
  {
    id: "blazers",
    label: "Blazers",
    image:
      "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop",
  },
  {
    id: "shoes",
    label: "Shoes",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop",
  },
  {
    id: "sunglasses",
    label: "Sunglasses",
    image:
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&auto=format&fit=crop",
  },
  {
    id: "perfumes",
    label: "Perfumes",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop",
  },
];

// Navbar mega-menu needs grouped structure (parent category -> subcategories).
// Kept separate from CATEGORIES since Home/NewArrivals use the flat list.
export const CATEGORY_MENU = [
  {
    title: "Topwear",
    groupSlug: "topwear",
    items: [
      { label: "T-Shirts", slug: "tshirts" },
      { label: "Casual Shirts", slug: "casual-shirts" },
      { label: "Formal Shirts", slug: "formal-shirts" },
      { label: "Sweatshirts", slug: "sweatshirts" },
      { label: "Hoodies", slug: "hoodies" },
      { label: "Sweaters", slug: "sweaters" },
      { label: "Blazers & Coats", slug: "blazers" },
    ],
  },
  {
    title: "Bottomwear",
    groupSlug: "bottomwear",
    items: [
      { label: "Jeans", slug: "jeans" },
      { label: "Casual Trousers", slug: "trousers" },
      { label: "Formal Trousers", slug: "formal-trousers" },
      { label: "Shorts", slug: "shorts" },
      { label: "Track Pants & Joggers", slug: "track-pants" },
    ],
  },
  {
    title: "Footwear",
    groupSlug: "footwear",
    items: [
      { label: "Casual Shoes", slug: "shoes" },
      { label: "Sports Shoes", slug: "sports-shoes" },
      { label: "Formal Shoes", slug: "formal-shoes" },
      { label: "Sneakers", slug: "sneakers" },
      { label: "Sandals & Floaters", slug: "sandals" },
      { label: "Flip Flops", slug: "flip-flops" },
    ],
  },
  {
    title: "Jackets & Outerwear",
    groupSlug: "outerwear",
    items: [
      { label: "Jackets", slug: "jackets" },
      { label: "Bomber Jackets", slug: "bomber-jackets" },
      { label: "Denim Jackets", slug: "denim-jackets" },
      { label: "Rain Jackets", slug: "rain-jackets" },
      { label: "Thermals", slug: "thermals" },
    ],
  },
  {
    title: "Fashion Accessories",
    groupSlug: "accessories",
    items: [
      { label: "Sunglasses", slug: "sunglasses" },
      { label: "Perfumes", slug: "perfumes" },
      { label: "Wallets", slug: "wallets" },
      { label: "Belts", slug: "belts" },
      { label: "Watches", slug: "watches" },
      { label: "Caps & Hats", slug: "caps" },
    ],
  },
];