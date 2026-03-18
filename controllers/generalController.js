const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const Mailgun = require("mailgun.js");
const formData = require("form-data");
const mealKitData = require("../modules/mealkit-util");

// send welcome email after registration
async function sendWelcomeEmail(firstName, lastName, toEmail) {
  try {
    const mg = new Mailgun(formData).client({
      username: "api",
      key: process.env.MAILGUN_API_KEY
    });

    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: "MamaMia Meal Kits <mailgun@" + process.env.MAILGUN_DOMAIN + ">",
      to: [toEmail, "nickroma.seneca@gmail.com"],
      subject: "Welcome to MamaMia Meal Kits!",
      text: "Hi " + firstName + " " + lastName + ",\n\n"
        + "Thanks for signing up to MamaMia Meal Kits!\n\n"
        + "Your account is ready to go. Browse this week's meal kits and get fresh ingredients delivered right to your door.\n\n"
        + "See you soon,\n"
        + "Lance Mbugua\n"
        + "MamaMia Meal Kits"
    });

    console.log("Email sent to " + toEmail);
  } catch (err) {
    // email errors should not stop registration from working
    console.log("Could not send email: " + err.message);
  }
}

// registration form validation
function validateRegistration(body) {
  const errors = [];

  if (!body.firstName || body.firstName.trim() == "") {
    errors.push("First name is required.");
  }
  if (!body.lastName || body.lastName.trim() == "") {
    errors.push("Last name is required.");
  }
  if (!body.email || body.email.trim() == "") {
    errors.push("Email is required.");
  }
  if (!body.password || body.password.trim() == "") {
    errors.push("Password is required.");
  }

  // check email format with regex
  if (body.email && body.email.trim() != "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      errors.push("Please enter a valid email address.");
    }
  }

  // password must be 8-12 chars with upper, lower, number and symbol
  if (body.password && body.password.trim() != "") {
    const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,12}$/;
    if (!pwRegex.test(body.password)) {
      errors.push("Password must be 8 to 12 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.");
    }
  }

  return errors;
}

// login form validation
function validateLogin(body) {
  const errors = [];

  if (!body.email || body.email.trim() == "") {
    errors.push("Email is required.");
  }
  if (!body.password || body.password.trim() == "") {
    errors.push("Password is required.");
  }
  if (!body.role || (body.role != "customer" && body.role != "clerk")) {
    errors.push("Please select a role.");
  }

  return errors;
}

// GET /
router.get("/", function(req, res) {
  const allMeals = mealKitData.getAllMealKits();
  const featuredMeals = mealKitData.getFeaturedMealKits(allMeals);
  res.render("general/home", { featuredMeals: featuredMeals });
});

// GET /sign-up
router.get("/sign-up", function(req, res) {
  res.render("general/sign-up", { errors: [], formData: {} });
});

// POST /sign-up
router.post("/sign-up", async function(req, res) {
  const { firstName, lastName, email, password } = req.body;

  const errors = validateRegistration(req.body);
  if (errors.length > 0) {
    return res.render("general/sign-up", {
      errors: errors,
      formData: { firstName, lastName, email }
    });
  }

  try {
    // check if email already registered
    const existing = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.render("general/sign-up", {
        errors: ["That email is already registered. Please log in instead."],
        formData: { firstName, lastName, email }
      });
    }

    // hash the password before saving
    const hashed = await bcrypt.hash(password, 10);

    await userModel.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      role: "customer"
    });

    await sendWelcomeEmail(firstName.trim(), lastName.trim(), email.trim());

    res.redirect("/welcome");

  } catch (err) {
    console.log("Registration error: " + err);
    res.render("general/sign-up", {
      errors: ["Something went wrong. Please try again."],
      formData: { firstName, lastName, email }
    });
  }
});

// GET /log-in
router.get("/log-in", function(req, res) {
  res.render("general/log-in", { errors: [], formData: {} });
});

// POST /log-in
router.post("/log-in", async function(req, res) {
  const { email, password, role } = req.body;

  const errors = validateLogin(req.body);
  if (errors.length > 0) {
    return res.render("general/log-in", {
      errors: errors,
      formData: { email, role }
    });
  }

  try {
    const user = await userModel.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.render("general/log-in", {
        errors: ["Sorry, you entered an invalid email and/or password."],
        formData: { email, role }
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.render("general/log-in", {
        errors: ["Sorry, you entered an invalid email and/or password."],
        formData: { email, role }
      });
    }

    if (user.role != role) {
      return res.render("general/log-in", {
        errors: ["The selected role does not match your account."],
        formData: { email, role }
      });
    }

    // save user info to session
    req.session.user = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };

    if (user.role == "clerk") {
      res.redirect("/mealkits/list");
    } else {
      res.redirect("/cart");
    }

  } catch (err) {
    console.log("Login error: " + err);
    res.render("general/log-in", {
      errors: ["Something went wrong. Please try again."],
      formData: { email, role }
    });
  }
});

// GET /logout
router.get("/logout", function(req, res) {
  req.session.destroy(function() {
    res.redirect("/log-in");
  });
});

// GET /welcome
router.get("/welcome", function(req, res) {
  res.render("general/welcome");
});

// GET /cart
router.get("/cart", function(req, res) {
  if (!req.session.user) {
    return res.status(401).render("general/error", {
      statusCode: 401,
      errorMessage: "You are not authorized to view this page."
    });
  }

  if (req.session.user.role != "customer") {
    return res.status(401).render("general/error", {
      statusCode: 401,
      errorMessage: "You are not authorized to view this page."
    });
  }

  res.render("general/cart", { user: req.session.user });
});

module.exports = router;
