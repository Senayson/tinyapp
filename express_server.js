const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var cookieParser = require('cookie-parser')

app.use(cookieParser());

app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
function checkIfEmailExists(email) {
  email = email.toLowerCase();
  const keys = Object.keys(users);
  for(let user of keys){
    if(users[user].email === email){
     return true;
    }
  }
  return false;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies.user_id };
  console.log("Line 48: " , templateVars)
  res.render("urls_index", templateVars)
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies.user_id };
  res.render("registering", templateVars)
});

app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, user: req.cookies.user_id};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body.longURL);  
  let newshortURL = generateRandomString();
  urlDatabase[newshortURL] = req.body.longURL;
  console.log(urlDatabase)
  //res.send("Ok"); 

  res.redirect(`/urls/${newshortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL, user: req.cookies.user_id };
  res.render("urls_show", templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL, user: req.cookies.user_id };
  res.render("/urls_show", templateVars);
})

app.post("/urls/show/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(shortURL);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  res.cookie('user_id', users[id]);

  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  if(!email || !password){
    res.status(400).send("Please fill both fields");
  }
  if(!checkIfEmailExists(email)){
    res.status(400).send("Email already exists");
  }
  
  users[id] = { id, email, password };
  res.cookie('user_id', users[id]);
  console.log("Line 121: " , users);
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

