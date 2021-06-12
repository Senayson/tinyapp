const express = require("express");
const { getUserbyEmail } = require('./helpers');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");

// OUR USER DATABASE
const users = {
  
};

//OUR URL DATABASE
const urlDatabase = {};

//Function to generate a random alphanumeric string
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

//Function to Create a new user object
const createUser = function(email, password) {
  const securePassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();

  const newUser = { id: userId, email, password: securePassword };
  users[userId] = newUser;
  return userId;
};

//Function to Filter Database by UserID
const urlsForUser = function(id, urls) {
  let filtered = {};
  for (let url in urls) {
    if (urlDatabase[url].userID === id) {
      filtered[url] = urls[url];
    }
  }
  return filtered;
};

//ROUTE FOR HOME PAGE
app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(users);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Route for urls page
app.get("/urls", (req, res) => {

  if (!req.session.userId) {
    res.status(400).send('Please login or register first');
    return;
  }

  let id = req.session.userId.id;

  const templateVars = { urlDatabase: urlsForUser(id, urlDatabase), user: req.session.userId };
  
  res.render("urls_index", templateVars);
});

//Route for register page
app.get("/register", (req, res) => {

  const templateVars = { user: null };

  res.render("registering", templateVars);
});

//Route to display Creating new shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = { urlDatabase, user: req.session.userId };
  let user = templateVars.user;
  if (user && typeof user !== 'undefined') {
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect("/login");
});

//Route for creating a new shortURL
app.post("/urls", (req, res) => {

  let newshortURL = generateRandomString();
  urlDatabase[newshortURL] = { longURL: req.body.longURL, userID: req.session.userId.id };
  res.redirect("/urls");
});

//Route for log in page
app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("login", templateVars);
});

//Route for accessing shortURL and associated LongURL
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.userId) {
    res.status(400).send('Can\'t access this without logging in');
    return;
  }
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  let id = req.session.userId.id;
  const templateVars = { urlDatabase: urlsForUser(id), shortURL, longURL , user: req.session.userId };
  res.render("urls_show", templateVars);
});

//Route from short-URL to long-URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Route for deleting shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.userId) {
    res.status(400).send('Can\'t access this without logging in');
    return;
  }
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Route to render shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: req.session.userId };
  res.render("/urls_show", templateVars);
});

//Route to modify longURL
app.post("/urls/show/:shortURL", (req, res) => {
  if (!req.session.userId) {
    res.status(400).send('Can\'t access this without logging in');
    return;
  }
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;

  res.redirect("/urls");
});

//Route to process Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send('Please fill both fields');
    return;
  }
  let user = getUserbyEmail(email, users);

  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.userId = user;
      res.redirect("/urls");
    } else {

      res.status(403).send("Username or Password is incorrect");
      return;
    }
  } else {

    res.status(403).send('user not found');
    return;
  }

});

//Route to process Logout
app.post("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/urls");
});

//Route to process registration
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Please fill both fields");
  }
  if (getUserbyEmail(email, users) === false) {
    const userId = createUser(email, password);

    req.session.userId = users[userId];
    res.redirect("/urls");
  } else {
    res.status(400).send("Email already exists");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

