/*************************************************************************************
* WEB322 - 2261 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Lance Mbugua
* Student ID    : 144111226
* Student Email : limbugua@myseneca.ca
* Course/Section: WEB322/NCC
*
*************************************************************************************/

require("dotenv").config({ path: ".keys" });

const path = require("path");
const express = require("express");
const app = express();

const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected."))
  .catch(err => console.log("DB error: " + err));

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// pass logged-in user to all views
app.use(function(req, res, next) {
  res.locals.sessionUser = req.session.user || null;
  next();
});

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");


// Add your routes here
// e.g. app.get() { ... }

// controllers
const generalController = require("./controllers/generalController");
const mealkitsController = require("./controllers/mealkitsController");

// routes
app.use("/", generalController);
app.use("/mealkits", mealkitsController);


// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).render("general/error", {
        statusCode: 404,
        errorMessage: "Page not found."
    });
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).render("general/error", {
        statusCode: 500,
        errorMessage: "Something went wrong. Please try again."
    });
});


// *** DO NOT MODIFY THE LINES BELOW ***

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);