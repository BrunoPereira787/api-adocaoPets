const getToken = require("../middlewares/getToken");
const getUserByToken = require("../middlewares/getUserByToken");
const Pet = require("../models/Pet");
const ObjectId = require("mongoose").Types.ObjectId;

class PetController {
  static async create(req, res) {
    const { name, age, weight, description } = req.body;

    const images = req.files;

    const available = true;

    if (!name || !age || !weight) {
      res
        .status(422)
        .json({ message: "Verifique se todos os dados foram preenchidos" });
      return;
    }

    if (images.length === 0) {
      res.status(422).json({ message: "A imagem é obrigatoria" });
      return;
    }

    const token = getToken(req);
    const user = await getUserByToken(token);

    const pet = {
      name,
      age,
      weight,
      description,
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        cell: user.cell,
        image: user.image,
        state: user.state,
        city: user.city,
        district: user.district,
      },
    };

    images.map((image) => {
      pet.images.push(image.filename);
    });

    try {
      const newPet = await Pet.create(pet);
      res.status(200).json({
        message: "Pet cadastrado com sucesso",
        newPet,
      });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async petsAll(req, res) {
    const pets = await Pet.find().sort("-createdAt");
    try {
      res.status(200).json({ pets });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }

  static async getUserPets(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    try {
      const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt");
      res.status(200).json({ pets });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }

  static async getUserPetById(req, res) {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "ID inválido" });
    }

    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado" });
      return;
    }

    try {
      res.status(200).json({ pet });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }

  static async deletePetById(req, res) {
    const { id } = req.params;

    const token = getToken(req);
    const user = await getUserByToken(token);

    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "ID inválido" });
    }

    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      return res.status(422).json({ message: "Pet não encontrado" });
    }

    if (pet.user._id.toString() !== user._id.toString()) {
      return res.status(422).json({
        message:
          "Houve um problema ao proccesar sua solicitação, tente novamente masi tarde",
      });
    }

    try {
      await Pet.findByIdAndRemove(id);
      res.status(200).json({ message: "Pet removido com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }

  static async updatePet(req, res) {
    const { id } = req.params;

    const { name, age, weight, description } = req.body;
    const images = req.files;

    const token = getToken(req);
    const user = await getUserByToken(token);

    const updatePet = {};

    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "ID inválido" });
    }

    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      return res.status(422).json({ message: "Pet não encontrado" });
    }

    if (pet.user._id.toString() !== user._id.toString()) {
      return res.status(422).json({
        message:
          "Houve um problema ao proccesar sua solicitação, tente novamente masi tarde",
      });
    }

    if (!name) {
      return res.status(422).json({ message: "O nome é obrigatorio" });
    }
    updatePet.name = name;

    if (!age) {
      return res.status(422).json({ message: "A idade é obrigatoria" });
    }
    updatePet.age = age;

    if (!weight) {
      return res.status(422).json({ message: "O peso é obrigatorio" });
    }
    updatePet.weight = weight;

    if (description) {
      updatePet.description = description;
    }

    if (images.length > 0) {
      updatePet.images = [];
      images.map((image) => {
        updatePet.images.push(image.filename);
      });
    }

    try {
      await Pet.findByIdAndUpdate(id, updatePet);
      res.status(200).json({ message: "Pet atualizado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }

  static async concludeAdoption(req, res) {
    const { id } = req.params;

    const token = getToken(req);
    const user = await getUserByToken(token);

    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "ID inválido" });
    }

    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado" });
      return;
    }

    if (pet.user._id.toString() !== user._id.toString()) {
      return res.status(422).json({
        message:
          "Houve um problema ao proccesar sua solicitação, tente novamente masi tarde",
      });
    }
    pet.available = false;
    try {
      await Pet.findByIdAndUpdate(id, pet);
      res.status(200).json({
        message: "Parabens, o ciclo de adoção foi concluido com sucesso",
      });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }
}

module.exports = PetController;
