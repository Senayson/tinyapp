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
    password: "purple-monkey-dinosaur" },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
function checkIfEmailExists(email) {
  email = email.toLowerCase();
  const keys = Object.keys(users);
  for(let userId of keys){
    if(users[userId].email === email){
     return users[userId];
    }
  }
  return false;
}

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
  const templateVars = { urlDatabase, user: req.cookies.user_id };
  res.render("urls_index", templateVars)
});

app.get("/register", (req, res) => {
  const templateVars = { urlDatabase, user: req.cookies.user_id };
  res.render("registering", templateVars)
});

app.get("/urls/new", (req, res) => {
  const templateVars = {urlDatabase, user: req.cookies.user_id};
  console.log("Line 71: " , req.cookies);
 let user = templateVars.user;
  if(user && typeof user !== 'undefined'){
    res.render("urls_new", templateVars);
    return;
  } 
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  
  let newshortURL = generateRandomString();
  urlDatabase[newshortURL] = req.body.longURL;
  
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {};
  res.render("login", templateVars);
})

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL, user: req.cookies.user_id };
  res.render("urls_show", templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL].longURL;
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
  urlDatabase[shortURL].longURL = req.body.longURL;
  console.log("Line 120:" ,req.body);
  console.log("Below is our database:" ,urlDatabase);

  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  const email =req.body.email;
  const password = req.body.password;
  if(!email || !password){
    res.status(400).send('Please fill both fields');
    return;
  }
  let user = checkIfEmailExists(email);

  if(user){
    if(user.password === password){
      res.cookie('user_id', user);
      res.redirect("/urls"); 
    } else {

      res.status(403).send("Username or Password is incorrect");
      return;
    }
  } else {
    
    res.status(403).send('user not found');
    return;
  }
  
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
  if(checkIfEmailExists(email) === false){
    users[id] = { id, email, password };
    res.cookie('user_id', users[id]);
    console.log("Line 121: " , users);
    res.redirect("/urls");
  } else{

    res.status(400).send("Email already exists");
  }
  
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

