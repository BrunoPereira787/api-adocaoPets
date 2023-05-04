const mongoose = require("mongoose");

const conn = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Conectado ao MongoDB"))
    .catch((err) => console.log(err));
};

module.exports = conn;
