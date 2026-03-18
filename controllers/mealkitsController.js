const express = require("express");
const router = express.Router();
const mealKitData = require("../modules/mealkit-util");

// GET /mealkits
router.get("/", function(req, res) {
  const allMeals = mealKitData.getAllMealKits();
  const groupedMeals = mealKitData.getMealKitsByCategory(allMeals);
  res.render("mealkits/on-the-menu", { categories: groupedMeals });
});

// GET /mealkits/list - only for data clerks
router.get("/list", function(req, res) {
  if (!req.session.user) {
    return res.status(401).render("general/error", {
      statusCode: 401,
      errorMessage: "You are not authorized to view this page."
    });
  }

  if (req.session.user.role != "clerk") {
    return res.status(401).render("general/error", {
      statusCode: 401,
      errorMessage: "You are not authorized to view this page."
    });
  }

  const allMeals = mealKitData.getAllMealKits();
  const groupedMeals = mealKitData.getMealKitsByCategory(allMeals);

  res.render("mealkits/list", {
    user: req.session.user,
    categories: groupedMeals
  });
});

module.exports = router;
