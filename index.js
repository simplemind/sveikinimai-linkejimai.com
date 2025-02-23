if (process.env.NODE_ENV !== "production") {
  // if we are in development require the dotenv package
  require("dotenv").config();
}
const express = require("express");
// Requiring NodeJs path module so I can set up an absolute path for views directory
const path = require("path");
const mongoose = require("mongoose"); //Requiring mongoose
//Requiring the Category and Greeting schemas
// Uppercased because it is a constructor function
const Category = require("./models/categoriesModel");
const Greeting = require("./models/greetingsModel");
// DB_URL parameter from Production or local mongodb Url otherwise
const dbUrl = "mongodb+srv://adminuser:Adminpass01@clustersveikinimai.uu5tqud.mongodb.net/dbSveikinimai";
// const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/dbSveikinimai";
// const dbUrl = "mongodb+srv://adminuser:Adminpass01@clustersveikinimai.uu5tqud.mongodb.net/dbSveikinimai";
// Importing an extended Error class for handling Express errors
const ExpressError = require("./utilities/ExpressError");
const ejsMate = require("ejs-mate"); //Importing ejs-mate npm package
// For generating homepage greetings
const pageDefaultTags = require("./utilities/defaults"); //Importing default values for the page
const helmet = require("helmet"); //Importing helmet for managing security headers

function handleError(error, res) {
  console.error(error);
  res.status(500).render("error", { error });
}

// Connecting to mongodb with mongoose
// mongoose.connect(dbUrl).catch((error) => {
//   handleError(error);
// });
const connectDb = async () => {
  try {
    const conn = await mongoose.connect(dbUrl);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    handleError(error);
  }
};
// Call the function to connect to MongoDB
connectDb();

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

// Middleware that run on every request.
//  assigns pageTags and rootUrl without mutating the pageDefaultTags object
app.use((req, res, next) => {
  // Constructing the rootUrl using req.get('host') and req.protocol
  const rootUrl = new URL(`${req.protocol}://${req.get("host")}`);

  // Adding rootUrl to res.locals to make it accessible in templates
  res.locals.rootUrl = rootUrl;

  // Creating a copy of the default pageTags object
  // This ensures pageDefaultTags is not modified unlike cont pageTags = pageDefaultTags
  const pageTags = Object.assign({}, pageDefaultTags);
  // Assigning pageTags to res.locals so it can be accessed in all views
  res.locals.pageTags = pageTags;

  // Get environment from process.env.NODE_ENV
  // console.log(process.env.NODE_ENV);
  res.locals.environment = process.env.NODE_ENV;
  next();
});

// Calling middleware with Helmet
const scriptSrcUrls = [
  "https://kit.fontawesome.com/",
  "*.fontawesome.com",
  "*.google-analytics.com",
  "https://www.googletagmanager.com",
  "https://pagead2.googlesyndication.com",
  "*.google.com",
  "*.adtrafficquality.google",
];
const styleSrcUrls = ["https://kit-free.fontawesome.com/", "https://fonts.googleapis.com/", "https://use.fontawesome.com/"];
const connectSrcUrls = ["https://ka-f.fontawesome.com/"];
const fontSrcUrls = ["https://fonts.gstatic.com/", "https://ka-f.fontawesome.com/"];

//Calling middleware with helmet
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls], // <script> elements & inline <script> blocks
      scriptSrcAttr: ["'unsafe-inline'", "'self'"], // For inline event handlers
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls], // CSS files
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: ["'self'", "blob:", "data:"],
      fontSrc: ["'self'", ...fontSrcUrls],
      mediaSrc: [],
      childSrc: ["blob:"], // Allow/Block loading other web apps inside the site
    },
  })
);

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
    .sort({ greetingOrderId: -1 })
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
  // Destructuring from res.locals that was assigned by middleware
  const { pageTags } = res.locals;
  const currentCategory = pageTags.categoryTag;

  const page = req.query.puslapis || 1;
  const categories = await getCategories();
  const greetings = await getGreetings(pageTags.categoryTag, page, true);
  const numberOfPages = await getNumberOfPages(pageTags.categoryTag);

  // Getting the root url for the page and environment from res.locals
  const { rootUrl, environment } = res.locals;

  // Passing defaultCategory so it can be read by add-greetings.js
  res.render("home", { environment, categories, greetings, rootUrl, pageTags, currentCategory, numberOfPages });
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

  // Getting the root url for the page and environment from res.locals
  const { rootUrl, environment } = res.locals;

  res.render("category", { environment, categories, greetings, rootUrl, pageTags, currentCategory, numberOfPages });
});

// GDPR privacy policy page
app.get("/privatumo-politika", async (req, res) => {
  // Creating a copy of the default pageTags object
  // Destructuring from res.locals that was assigned by middleware
  const { pageTags } = res.locals;

  // Getting the root url for the page
  const { rootUrl } = res.locals;

  // Passing defaultCategory so it can be read by add-greetings.js
  res.render("privatumo-politika");
});

// API route for fetching greetings
app.get("/api/get-greetings/:category/:page?", async (req, res) => {
  const { category, page } = req.params;

  const greetings = await getGreetings(category, page);
  res.json(greetings);
});

// sitemap.xml route
app.get("/sitemap.xml", (req, res) => {
  // Getting the root url from res.locals
  const { rootUrl } = res.locals;

  // Start XML content
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  xml += `<url>
          <loc>https://www.sveikinimai-linkejimai.com/</loc>
          <priority>1.0</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/gimtadienio</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/jubiliejaus</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/romantiski</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/draugams</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/vestuviu</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/naujagimio</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/krikstynu</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/mokykliniai</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/velykiniai</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/vardadienio</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/joninem</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/moters-dienai</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/mamos-dienai</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/tecio-dienai</loc>
         <priority>0.8</priority>
          </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/naujametiniai</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/kalediniai</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/proga/kuciu</loc>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>https://www.sveikinimai-linkejimai.com/privatumo-politika</loc>
          <priority>0.5</priority>
        </url>`;

  // Close XML
  xml += "</urlset>";

  // Set content type to XML
  res.header("Content-Type", "application/xml");
  res.send(xml);
});

// Must be placed at the end of all routes
//   matches all types of HTTP requests (GET, POST, PUT, DELETE, etc.) on all routes that are not matched by any other route handlers above
// Runs a middleware function that creates an error and passes it to the next middleware function
app.all("*", (req, res, next) => {
  // This creates a new ExpressError object with a message of "Page not found"
  //   and a status code of 404, and passes it to the next middleware in the stack.
  next(new ExpressError("Page not found", 404));
});

//Error handling middleware
app.use(function (err, req, res, next) {
  const { statusCode = 500 } = err; // Destructuring from the error with default values in case not passed by the error
  if (!err.message) err.message = "SOMETHING WENT WRONG";
  // res.render("error"); //Renders error.ejs with err object passed through
  res.status(statusCode).render("error", { err }); //Renders error.ejs with err object passed through
});

// Listening on production for PORT. If not PORT then in development environment and use 3000
const port = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log(`LISTENING ON PORT ${port}`);
});
