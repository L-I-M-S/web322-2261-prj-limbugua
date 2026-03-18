// modules/mealkit-util.js
const mealkits = [
  {
    title: "Classic Avoca-Dip & Chips",
    includes: "Fresh avocados, tomatoes, onions, lime, and homemade tortilla chips",
    description: "The timeless favorite: creamy guacamole paired with crispy chips.",
    category: "Guacamole Classics",
    price: 15.99,
    cookingTime: 15,
    servings: 2,
    imageUrl: "/images/classic-guac.jpg",
    featuredMealKit: true
  },
  {
    title: "Fiery Jalapeño Smash",
    includes: "Avocados, jalapeños, cilantro, lime, and crunchy veggie sticks",
    description: "A bold kick of heat in every creamy bite.",
    category: "Guacamole Classics",
    price: 14.99,
    cookingTime: 20,
    servings: 2,
    imageUrl: "/images/spicy-guac.jpg",
    featuredMealKit: false
  },
  {
    title: "Guac-Stuffed Burger Kit",
    includes: "Avocados, ground beef patties, buns, cheese, and fresh toppings",
    description: "Juicy burgers topped with house-made guacamole.",
    category: "Guacamole Classics",
    price: 19.99,
    cookingTime: 25,
    servings: 2,
    imageUrl: "/images/burger-guac.jpg",
    featuredMealKit: true
  },
  {
    title: "Avocado Fiesta Bowl",
    includes: "Avocados, mixed greens, corn, black beans, tomatoes, and lime dressing",
    description: "A fresh, vibrant bowl full of guacamole flavor.",
    category: "Guacamole Classics",
    price: 16.99,
    cookingTime: 10,
    servings: 2,
    imageUrl: "/images/salad-guac.jpg",
    featuredMealKit: false
  },
  {
    title: "Avocado Maki Rolls",
    includes: "Avocados, sushi rice, nori sheets, cucumber, and spicy mayo",
    description: "Guacamole-inspired sushi rolls with a creamy twist.",
    category: "Guacamole Fusion",
    price: 18.99,
    cookingTime: 30,
    servings: 2,
    imageUrl: "/images/sushi-guac.jpg",
    featuredMealKit: true
  },
  {
    title: "Guac-Topped Pizza Party",
    includes: "Avocados, pizza dough, mozzarella, tomatoes, and fresh herbs",
    description: "DIY pizza finished with generous guacamole topping.",
    category: "Guacamole Fusion",
    price: 17.99,
    cookingTime: 25,
    servings: 2,
    imageUrl: "/images/pizza-guac.jpg",
    featuredMealKit: false
  }
];

function getAllMealKits() {
  return mealkits;
}

function getFeaturedMealKits(mealkits) {
  return mealkits.filter(kit => kit.featuredMealKit);
}

function getMealKitsByCategory(mealkits) {
  const groups = mealkits.reduce((acc, kit) => {
    if (!acc[kit.category]) {
      acc[kit.category] = [];
    }
    acc[kit.category].push(kit);
    return acc;
  }, {});
  return Object.keys(groups).map(categoryName => ({
    categoryName,
    mealKits: groups[categoryName]
  }));
}

module.exports = {
  getAllMealKits,
  getFeaturedMealKits,
  getMealKitsByCategory
};