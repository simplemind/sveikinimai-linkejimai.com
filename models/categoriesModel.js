const mongoose = require("mongoose");
// Shortening so that Schema refers to mongoose.Schema
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  categoryTag: String,
  categoryName: String,
  orderNumber: Number,
  pageTitle: String,
  pageHeadingH1: String,
  metaDescription: String,
  metaKeywords: String,
  onpageKeywords: String,
});

// Compiling as name 'Category' with Schema CategorySchema and then we export the model
module.exports = mongoose.model("Category", CategorySchema);
