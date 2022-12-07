const express = require("express");
const morgan = require("morgan")
const cookieParser = require(('cookie-parser'))
const app = express();
const PORT = 8080; // default port 8080
const { v4: uuid } = require('uuid');
const bcrypt = require("bcryptjs")

const cookieSession = require('cookie-session');
const helpers = require("./helpers");
const getUserByEmail = helpers.getUserByEmail;
const generateRandomString = helpers.generateRandomString;
// const urlsForUser = helpers.urlsForUser;

// function generateRandomString() {
//   let x = uuid();
//   return x.substring(0, 6);
// }


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
    password: '1235'
  },
  def: {
    id: 'def',
    email: 'tambam@mail.com',
    password: '7895'
  }
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cookieSession({
  name: 'bangarang',
  keys: ["rufio"]
}))

app.get("/register", (req, res) => {
  res.render("registration", req.body);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }
  res.render('login', templateVars)
});

app.get("/urls/new", (req, res) => {
  const randomUserID = req.cookies["user_id"] 
  const loggedInUser = users[randomUserID]
  const templateVars = {
    user: loggedInUser
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const randomUserID = req.cookies["user_id"] 
  const loggedInUser = users[randomUserID]
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: loggedInUser
  };
  res.render("urls_show", templateVars)
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  // const currentUserName = req.cookies["username"]
  const randomUserID = req.cookies["user_id"] 
  const loggedInUser = users[randomUserID]
  const templateVars = {
    // username: currentUserName,
    user: loggedInUser,
    // ... any other vars
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log('request body', req.body["longURL"]);
  console.log('generate random string', generateRandomString());
  const shortURL = generateRandomString();
  const longURL = req.body.longURL 
    if (longURL.includes('http')) {  // this is ensuring clean redirection
      urlDatabase[shortURL] = req.body["longURL"];
    } else {
      const modifiedURL = `http://${longURL}`;
      urlDatabase[shortURL] = modifiedURL
    }  
  console.log('urlDatabase', urlDatabase);// Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`); // redirecting user with interpilated 
});

app.post('/register', (req, res) => {
  console.log('req.body', req.body)
  const newUserID = generateRandomString();
  //create a new user object with id - email - password
  const newUser = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password
  };
  //add the new user into the global users object
  console.log('Before', users)
  users[newUserID] = newUser
  console.log('After', users) 
  // if email or password are empty, send back (400) response code
  if (newUser === '') {
    return res.status(404).send('Error 404: Email or Password missing')
  }
  // if email already exists in system, send back a (400) response
  if (newUser.users) {
    return res.render('registered');
  }
  //store only the user id into the session cookie
  res.cookie("user_id", newUserID);
  res.redirect("/urls")
})

app.post('/login', (req, res) => {
  const password = req.body.password;
  //using email find the user in global users object
  templateVars = {
    user: users[req.cookies.user_id]
  };
  
  const user = getUserByEmail(req.body.email, users);
    if (!user) {
      //if no user found return (404)
      return res.status(404).send("This user does not exist");
    }
    //if password fails return (404) 
    if (user && !bcrypt.compareSync(password, user.password)) {
      return res.status(404).send("Password not found")
    }
    const user_id = user.id 

    req.session.user_id = user_id;
    res.redirect("/urls");
  });

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post("/urls/:id/edit", (req, res) => {
  console.log('request body', req.body["longURL"]);
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id);
  const id = req.params.id;
  delete urlDatabase[id];
  console.log(urlDatabase[id]);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

