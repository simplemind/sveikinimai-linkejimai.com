// NOT WORKING YET
// A sitemap generator that loops through categories collection and generates a sitemap.xml file
// Usage: node utilities/siteMapGenerator.js
const mongoose = require("mongoose"); //Requiring mongoose
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/dbSveikinimai";
const homeUrl = "https://www.sveikinimai-linkejimai.com";
const fs = require("fs");
const Category = require("../models/categoriesModel");
const path = require("path"); // Import path module
// Dates in case we want to add lastmod
const now = new Date();
const year = now.getFullYear();
const month = (now.getMonth() + 1).toString().padStart(2, "0");
const day = now.getDate().toString().padStart(2, "0");

// Connecting to mongodb with mongoose
mongoose.connect(dbUrl).catch((error) => {
  console.log(error);
});
const db = mongoose.connection; //Shortening so we can reference db instead of mongoose.connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected"); //Prints to terminal console if connected to the database
});

// Generate sitemap header section
const sitemapPath = path.join(__dirname, "../sitemap.xml"); // Define the sitemap file path
const sitemap = fs.createWriteStream(sitemapPath); // Create write stream for sitemap file

sitemap.write('<?xml version="1.0" encoding="UTF-8"?>\n');
sitemap.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n');
sitemap.write(' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n');
sitemap.write(' xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n');
sitemap.write(' http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n');

// Homepage
sitemap.write(`
    <url>
      <loc>${homeUrl}/</loc>
      <priority>1.0</priority>
    </url>
  `);

//Generate <url> for each category in the database
async function getCategories() {
  const categories = await Category.find({});
  // Sort the categories by orderNumber
  categories.sort((a, b) => {
    return a.orderNumber - b.orderNumber;
  });
  return categories;
}
const categories = getCategories();

//
categories.forEach((category) => {
  console.log(category.categoryTag);

  sitemap.write(`
    <url>
      <loc>${homeUrl}/sveikinimai/${category.categoryTag}</loc>
      <priority>0.8</priority>
    </url>
  `);
});

// Privatumo politika page
sitemap.write(`
  <url>
    <loc>${homeUrl}/privatumo-politika</loc>
    <priority>0.1</priority>
  </url>
`);

sitemap.write("</urlset>");
sitemap.end();

// End mongoose connection
// db.close();

/* 
STRUCTURE OF SITEMAP.XML FILE

<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">


<url>
  <loc>https://www.example.com/page1.html</loc>
  <lastmod>2023-12-24</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.8</priority>
</url>

    <loc>: This tag specifies the URL of the page. It's mandatory for each <url> entry.

    <lastmod>: Optional. Indicates the last modified date of the page. Helpful for search engines to understand the page's freshness.

    <changefreq>: Optional. Specifies how frequently the page's content changes. It can be set to values like "always," "hourly," "daily," "weekly," "monthly," "yearly," or "never."

    <priority>: Optional. Indicates the priority of a particular URL concerning other URLs on your site. The value ranges from 0.0 to 1.0.

*/
