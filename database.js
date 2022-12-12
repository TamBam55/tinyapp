const bcrypt = require("bcryptjs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca/",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca/",
    userID: "aJ48lW",
  },
};


const users = {
  abc: {
    id: 'abc',
    email: 'a@a.com',
    password: bcrypt.hashSync('1235', 10)
  },
  def: {
    id: 'def',
    email: 'tambam@mail.com',
    password: bcrypt.hashSync('7895', 10)
  }
};


module.exports = { users, urlDatabase }