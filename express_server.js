const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser')
//const morgan = require('morgan');

app.use(cookieParser());
app.set("view engine", "ejs");


// OUR USER DATABASE
const users = { };

//OUR URL DATABASE
const urlDatabase = {};

//Function to generate a random alphanumeric string
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

//FUNCTION TO CHECK IF EMAIL ALREADY EXISTS
function checkIfEmailExists(email) {
  email = email.toLowerCase();
  const keys = Object.keys(users);
  for (let userId of keys) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
}

//Function to Create a new user object
function createUser(email, password) {
  const securePassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();

 const newUser = { id: userId, email, password: securePassword};
 users[userId] = newUser;
 return userId;
};
//Filter Database by UserID
function urlsForUser(id) {
  let filtered = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filtered[url] = urlDatabase[url];
    }
  }
  return filtered;
}

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

  if (!req.cookies.user_id) {
    res.status(400).send('Please login or register first')
    return;
  }

  let id = req.cookies.user_id.id;

  const templateVars = { urlDatabase: urlsForUser(id), user: req.cookies.user_id };
  let user = templateVars.user;

  console.log("This is templateVars.urlDatabase: ", templateVars.urlDatabase);

  res.render("urls_index", templateVars);
});
//Route for register page
app.get("/register", (req, res) => {
  const templateVars = { urlDatabase, user: req.cookies.user_id };
  res.render("registering", templateVars)
});

//Route to display Creating new shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = { urlDatabase, user: req.cookies.user_id };
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
  urlDatabase[newshortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id.id };
  res.redirect("/urls");
});

//Route for log in page
app.get("/login", (req, res) => {
  const templateVars = {};
  res.render("login", templateVars);
})

//Route for accessing shortURL and associated LongURL
app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies.user_id) {
    res.status(400).send('Can\'t access this without logging in')
    return;
  }
  let id = req.cookies.user_id.id;
  const templateVars = { urlDatabase: urlsForUser(id), shortURL: req.params.shortURL, user: req.cookies.user_id }
  res.render("urls_show", templateVars);
});

//Route for short-URL to long-URL
app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Route for deleting shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.cookies.user_id) {
    res.status(400).send('Can\'t access this without logging in')
    return;
  }
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
  if (!req.cookies.user_id) {
    res.status(400).send('Can\'t access this without logging in')
    return;
  }
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;

  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send('Please fill both fields');
    return;
  }
  let user = checkIfEmailExists(email);

  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
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
  if (!email || !password) {
    res.status(400).send("Please fill both fields");
  }
  if (checkIfEmailExists(email) === false) {
     const userId = createUser(email, password);
  
    res.cookie('user_id', users[userId]);
    res.redirect("/urls");
  } else {

    res.status(400).send("Email already exists");
  }

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

