const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const validate = (value) => {
  const regex = /^([0-9]{2})([0-9]{4,5})([0-9]{4})$/;
  let str = value.replace(/[^0-9]/g, "").slice(0, 11);
  const result = str.replace(regex, "($1)$2-$3");
  return result;
};

// middlewares
const createUserToken = require("../middlewares/createUserToken");
const getToken = require("../middlewares/getToken");
const getUserByToken = require("../middlewares/getUserByToken");
const Pet = require("../models/Pet");

class UserController {
  static async register(req, res) {
    const {
      name,
      email,
      password,
      confirmpassword,
      phone,
      cell,
      cep,
      state,
      city,
      district,
      address,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !confirmpassword ||
      !phone ||
      !cell ||
      !cep
    ) {
      return res
        .status(422)
        .json({ message: "Verifique se todos os dados foram preenchidos" });
    }

    if (password !== confirmpassword) {
      return res.status(422).json({
        message: "A senha e a confirmação de senha precisam ser iguais",
      });
    }

    const userExists = await User.findOne({ email: email });

    if (userExists) {
      return res.status(422).json({
        message: "Esse Email ja esta em uso",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = {
      name,
      email,
      password: passwordHash,
      phone: validate(phone),
      cell: validate(cell),
      cep,
      state,
      city,
      district,
      address,
    };

    try {
      const newUser = await User.create(user);
      createUserToken(newUser, req, res);
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(422)
        .json({ message: "Verifique se todos os dados foam preenchidos" });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(422).json({ message: "Usuário invalido" });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(422).json({ message: "Senha inorreta" });
    }

    try {
      await createUserToken(user, req, res);
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }

  // adm
  static async getAllUsers(req, res) {
    const user = await User.find();

    if (user.length === 0) {
      return res
        .status(422)
        .json({ message: "Não há usuários cadastrados no sistema" });
    }

    try {
      res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }

  // adm
  static async getUserById(req, res) {
    const id = req.params.id;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(422).json({ message: "Usuário não encontrado" });
    }

    try {
      res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }

  static async getUserByToken(req, res) {
    try {
      if (req.headers.authorization) {
        const token = getToken(req);
        jwt.verify(token, process.env.SECRET_JWT, async (error, decoded) => {
          if (error) {
            return res.status(404).json({ message: "error" });
          }
          const user = await User.findById(decoded.id);

          user.password = undefined;
          res.status(200).send(user);
        });
      }
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async editUser(req, res) {
    const token = getToken(req);
    let user = await getUserByToken(token);

    const { name, email, phone, cell, cep, state, city, district, address } =
      req.body;

    /*if (req.file) {
      user.image = req.file.filename;
    }*/

    if (!name) {
      return res.status(422).json({ message: "Nome é obrigatorio" });
    }
    user.name = name;

    const userExists = await User.findOne({ email });

    if (user.email !== email && userExists) {
      return res.status(422).json({ message: "Ultilize outro email" });
    }
    user.email = email;

    if (!phone) {
      return res.status(422).json({ message: "telefone é obrigatorio" });
    }
    user.phone = phone;

    if (!cell) {
      return res.status(422).json({ message: "celulat é obrigatorio" });
    }
    user.cell = cell;

    if (!cep) {
      return res.status(422).json({ message: "o Cep é obrigatorio" });
    }

    user.cep = cep;
    user.state = state;
    user.city = city;
    user.district = district;
    user.address = address;

    try {
      await User.findByIdAndUpdate(user._id, { $set: user });
      res.status(200).json({ message: "Usuário atualizado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }

  static async deleteUser(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);
    try {
      await User.findByIdAndDelete(user._id);
      await Pet.deleteMany({ "user._id": user._id });
      res.status(200).json({ message: "usuario deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
}

module.exports = UserController;
