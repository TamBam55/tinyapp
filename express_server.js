const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const { v4: uuid } = require('uuid');

function generateRandomString() {
  let x = uuid();
  return x.substring(0, 6);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]}
  res.render("urls_show", templateVars)
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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