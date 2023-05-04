require("dotenv").config();
const express = require("express");
const cors = require("cors");

// conn
const conn = require("./db/conn");

//routes
const UserRoutes = require("./routes/UserRoutes");
const PetRoutes = require("./routes/PetRoutes");

const app = express();

const port = process.env.PORT || 5000;

conn();
app.use(cors());
app.use(express.json());
app.use(express.static("src/public"));

app.use("/users", UserRoutes);
app.use("/pets", PetRoutes);
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
