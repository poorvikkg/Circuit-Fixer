const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const routes = require("./routes/systemRoutes");
app.use("/api", routes);

app.listen(3000, () => {
  console.log("Fixy server running on port 3000");
});