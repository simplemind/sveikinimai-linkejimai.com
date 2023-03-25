const express = require("express");

const app = express();

// Listening on production for PORT. If not PORT then in development environment and use 3000
const port = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log(`LISTENING ON PORT ${port}`);
});
