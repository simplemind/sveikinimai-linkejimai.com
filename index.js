const express = require("express");
// Requiring NodeJs path module so I can set up an absolute path for views directory
const path = require("path");
const mongoose = require("mongoose"); //Requiring mongoose
//Requiring the Category and Greeting schemas
// Uppercased because it is a constructor function
const Category = require("./models/categoriesModel");
const Greeting = require("./models/greetingsModel");
// DB_URL parameter from Production or local mongodb Url otherwise
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/dbSveikinimai";
// Importing an extended Error class for handling Express errors
const ExpressError = require("./utilities/ExpressError");
const ejsMate = require("ejs-mate"); //Importing ejs-mate npm package

// Connecting to mongodb with mongoose
mongoose.connect(dbUrl).catch((error) => {
  handleError(error);
});

const db = mongoose.connection; //Shortening so we can reference db instead of mongoose.connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected"); //Prints to terminal console if connected to the database
});

// Getting an instance of Express
const app = express();

// Joining root directory with the /views/ directory to form an absolute path
// This tells Express where to find the views
app.set("views", path.join(__dirname, "views"));
// Setting view engine to ejs
app.set("view engine", "ejs");
// Telling Express to use ejsMate as the engine for .ejs files
// This will make it possible to use partials for modularizing the code
app.engine("ejs", ejsMate);

// CONTROLLERS
// Fetching categories
async function getCategories() {
  const categories = await Category.find({});
  // Sort the categories by orderNumber
  categories.sort((a, b) => {
    return a.orderNumber - b.orderNumber;
  });
  return categories;
}

// A function that returns 10 greetings from the database
async function getGreetings(categoryTag = "gimtadienio", startPosition = 0) {
  const greetings = await Greeting.find({ categoryTags: { $in: [categoryTag] } })
    .skip(startPosition)
    .limit(10);
  return greetings;
}

// ROUTES
app.get("/", async (req, res) => {
  const categories = await getCategories();
  const greetings = await getGreetings();

  res.render("home", { categories, greetings, title: "Homepage" });
});

app.get("/:category/:page", async (req, res) => {
  const { category, page } = req.params;

  const categories = await getCategories();
  const greetings = await getGreetings(category);

  res.render("category", { categories, greetings, category, page });
});

// Listening on production for PORT. If not PORT then in development environment and use 3000
const port = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log(`LISTENING ON PORT ${port}`);
});
