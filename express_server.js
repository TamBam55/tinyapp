const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");

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
    id: "abc",
    email: "a@a.com",
    password: bcrypt.hashSync("1235", 10),
  },
  def: {
    id: "def",
    email: "tambam@mail.com",
    password: bcrypt.hashSync("7895", 10),
  },
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "bangarang",
    keys: ["rufio"],
  })
);

app.get("/register", (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render("registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const randomUserID = req.session["user_id"];
  if (!req.session.user_id) {
    return res.status(401).send("Error 401: Unauthorized");
  }
  // const loggedInUser = users[randomUserID]
  if (!randomUserID) {
    return res
      .status(404)
      .send(
        `<h1>'You must be logged in to access this function'</h1><a href ="/login">Back to Login</a>`
      );
  }
  const templateVars = {
    user: randomUserID[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  // checking if user is logged in
  if (!user_id) {
    return res
      .status(400)
      .send(`<h1>Please log in<h1> <a href ="/login">Back to Login</a>`);
  }
  // checking if short id is in url database
  const user = users[user_id];
  const shortCodeUrl = req.params.id;
  if (!urlDatabase[shortCodeUrl]) {
    return res
      .status(400)
      .send(`<h1>URL doesn't exist<h1> <a href ="/urls">Back to Main Page</a>`);
  }
  // checking is user id matches logged in user
  if (user_id !== urlDatabase[shortCodeUrl].userID) {
    return res
      .status(400)
      .send(
        `<h1>URL doesn't belong to this user<h1> <a href ="/urls">Back to Main Page</a>`
      );
  }
  const templateVars = {
    id: shortCodeUrl,
    longURL: urlDatabase[req.params.id].longURL,
    user: user,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  // get user_id from session cookie
  const user_id = req.session.user_id;

  // check if user is logged in
  if (!user_id) {
    return res
      .status(400)
      .send(`<h1>Please log in<h1> <a href ="/login">Back to Login</a>`);
  }

  // get all URLs belonging to the logged in user
  const userUrls = urlsForUser(user_id, urlDatabase);

  // render template with userUrls
  const templateVars = {
    user: users[user_id],
    urls: userUrls,
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
    return;
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  if (!req.session.user_id) {
    return res.status(401).send("Error 401: Unauthorized");
  }
  if (longURL.includes("http")) {
    // this is ensuring clean redirection
    urlDatabase[shortURL] = req.body["longURL"];
  } else {
    const modifiedURL = `http://${longURL}`;
    urlDatabase[shortURL] = modifiedURL;
  }
  if (!longURL.includes("http")) {
    longURL = "http://" + longURL;
  }
  urlDatabase[shortURL] = { longURL, userID };

    // res.send("Ok"); // Respond with 'Ok' (we will replace this)
    res.redirect(`/urls/${shortURL}`); // redirecting user with interpilated
  });

app.post("/register", (req, res) => {
  console.log("req.body", req.body);
  const newUserID = generateRandomString();
  //create a new user object with id - email - password
  const newUser = {
    id: newUserID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  //add the new user into the global users object
  console.log("Before", users);

  // check if email already exists in users object
  let emailExists = false;
  for (const userID in users) {
    if (users[userID].email === newUser.email) {
      emailExists = true;
      break;
    }
  }

  if (emailExists) {
    return res.status(400).send("Email already registered");
  }

  // if email or password are empty, send back (400) response code
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Error: Email or password cannot be empty");
  }

  console.log("After", users);
  users[newUserID] = newUser;
  // log the user in by setting their user ID in the session
  req.session.user_id = newUserID;
  // create a cookie by setting the user ID in a cookie
  res.cookie("user_id", newUserID);
  // redirect the user to the URL index page
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const password = req.body.password;
  //using email find the user in global users object
  console.log(req.body);
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    //if no user found return (404)
    return res.status(404).send("This user does not exist");
  }
  //if password fails return (404)
  if (user && !bcrypt.compareSync(password, user.password)) {
    return res.status(404).send("Password not found");
  }
  const user_id = user.id;
  res.cookie("user_id", user_id);
  req.session.user_id = user_id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls/:id/edit", (req, res) => {
  if (
    !req.session.user_id ||
    req.session.user_id !== urlDatabase[req.params.id].userID
  ) {
    return res.status(401).send("Error 401: Unauthorized");
  }
  console.log("request body", req.body["longURL"]);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  if (
    !req.session.user_id ||
    req.session.user_id !== urlDatabase[req.params.id].userID
  ) {
    return res.status(401).send("Error 401: Unauthorized");
  }
  console.log(req.params.id);
  const id = req.params.id;
  delete urlDatabase[id];
  console.log(urlDatabase[id]);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
