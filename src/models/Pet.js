const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    images: {
      type: Array,
      required: true,
    },
    available: {
      type: Boolean,
    },
    user: Object,
    //adopter: Object,
  },
  { timestamps: true }
);

const Pet = mongoose.model("Pet", PetSchema);

module.exports = Pet;
