const mongoose = require("mongoose");
// Shortening so that Schema refers to mongoose.Schema
const Schema = mongoose.Schema;

const GreetingSchema = new Schema({
  greeting: String,
  categoryTags: [String],
});

// Compiling as name 'Greeting' with Schema GreetingSchema and then we export the model
module.exports = mongoose.model("Greeting", GreetingSchema);
