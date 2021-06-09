const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser')

app.use(cookieParser());

app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"],};
  res.render("urls_index", templateVars)
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body.longURL);  
  let newshortURL = generateRandomString();
  urlDatabase[newshortURL] = req.body.longURL;
  console.log(urlDatabase)
  //res.send("Ok"); 

  res.redirect(`/urls/${newshortURL}`);
});

 app.get("/urls/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL];
   const templateVars = { shortURL: req.params.shortURL , longURL: longURL, username: req.cookies["username"],};
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
   const templateVars = { shortURL: req.params.shortURL , longURL: longURL, username: req.cookies["username"],};
  res.render("/urls_show", templateVars);
})

app.post("/urls/show/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(shortURL);
urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
})
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username );
  const templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.redirect("/urls");
})

 
 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

