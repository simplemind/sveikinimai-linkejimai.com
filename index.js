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
// For generating homepage greetings
const pageDefaultTags = require("./utilities/defaults"); //Importing default values for the page

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
// Tells express where to serve the public directory from
//  This is important for stylesheets and scripts
app.use(express.static(path.join(__dirname, "public")));

// Setting view engine to ejs
app.set("view engine", "ejs");
// Telling Express to use ejsMate as the engine for .ejs files
// This will make it possible to use partials for modularizing the code
app.engine("ejs", ejsMate);

// CONTROLLERS
// Fetching categories
// The object contains categoryTag (used in Urls) , categoryName, orderNumber, pageTitle, pageHeadingH1, subheading
async function getCategories() {
  const categories = await Category.find({});
  // Sort the categories by orderNumber
  categories.sort((a, b) => {
    return a.orderNumber - b.orderNumber;
  });
  return categories;
}

// A function that returns 10 greetings from the database
async function getGreetings(categoryTag, page = 1, allFromFirst = false) {
  const perPage = 10;
  let skip = (page - 1) * perPage;
  let limit = perPage;

  // If allFromFirst is true, fetch greetings from page 1 to the specified page
  if (allFromFirst) {
    skip = 0;
    limit = page * perPage;
  }

  // Fetches greetings from the database with a specified categoryTag
  const arrayOfGreetingObjects = await Greeting.find({ categoryTags: { $in: [categoryTag] } })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);

  return arrayOfGreetingObjects;
}

// A function that works out the number of pages for pagination
// So we know when to stop pagination IntersectionObserver
async function getNumberOfPages(categoryTag) {
  const perPage = 10;
  // Fetches 10 greetings from the database with a specified categoryTag
  const numberOfGreetings = await Greeting.find({ categoryTags: { $in: [categoryTag] } }).countDocuments();
  const numberOfPages = Math.ceil(numberOfGreetings / perPage);
  return numberOfPages;
}

// A function that updates the pageTags object with the values from the database
async function updatePageTags(categoryTag, pageTags) {
  const category = await Category.findOne({ categoryTag });

  // create a copy of pageTags object to avoid mutation of pageTags object
  const updatedPageTags = { ...pageTags };

  updatedPageTags.categoryTag = category.categoryTag;
  updatedPageTags.categoryName = category.categoryName;
  updatedPageTags.pageTitle = category.pageTitle;
  updatedPageTags.pageHeadingH1 = category.pageHeadingH1;
  updatedPageTags.pageSubheading = category.pageSubheading;
  updatedPageTags.metaDescription = category.metaDescription;
  updatedPageTags.metaKeywords = category.metaKeywords;
  updatedPageTags.onpageKeywords = category.onpageKeywords;

  // Return the modified copy of pageTags object
  return updatedPageTags;
}

// ROUTES
// Homepage with query paramter "puslapis" for page number
// #ToDo: Add functionality to load greetings based on the page parameter
app.get("/", async (req, res) => {
  // Creating a copy of the default pageTags object
  // This ensures pageDefaultTags is not modified unlike cont pageTags = pageDefaultTags
  const pageTags = Object.assign({}, pageDefaultTags);
  const currentCategory = pageTags.categoryTag;

  const page = req.query.puslapis || 1;
  const categories = await getCategories();
  const greetings = await getGreetings(pageTags.categoryTag, page, true);
  const numberOfPages = await getNumberOfPages(pageTags.categoryTag);

  // Getting the root url for the page
  const rootUrl = req.protocol + "://" + req.get("host");

  // Passing defaultCategory so it can be read by add-greetings.js
  res.render("home", { categories, greetings, rootUrl, pageTags, currentCategory, numberOfPages });
});

// Page for selected category
// page? means that page is optional
app.get("/proga/:currentCategory", async (req, res) => {
  const { currentCategory } = req.params;
  // Updating pageTags and preventing mutation of pageDefaultTags within the function
  const pageTags = await updatePageTags(currentCategory, pageDefaultTags);

  const page = req.query.puslapis || 1;
  const categories = await getCategories();
  const greetings = await getGreetings(pageTags.categoryTag, page, true);
  const numberOfPages = await getNumberOfPages(pageTags.categoryTag);

  // Getting the root url for the page
  const rootUrl = req.protocol + "://" + req.get("host");

  res.render("category", { categories, greetings, rootUrl, pageTags, currentCategory, numberOfPages });
});

// API route for fetching greetings
app.get("/api/get-greetings/:category/:page?", async (req, res) => {
  const { category, page } = req.params;

  const greetings = await getGreetings(category, page);
  res.json(greetings);
});

// Listening on production for PORT. If not PORT then in development environment and use 3000
const port = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log(`LISTENING ON PORT ${port}`);
});
