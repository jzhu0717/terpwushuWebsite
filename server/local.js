require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const app = require("./app");

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`terpwushu API listening on http://localhost:${port}`);
});
