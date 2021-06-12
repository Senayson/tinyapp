

//FUNCTION TO CHECK IF EMAIL ALREADY EXISTS IN A DATABASE
function getUserbyEmail(email, database) {
  email = email.toLowerCase();
  const keys = Object.keys(database);
  for (let userId of keys) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return false;
}


module.exports = { getUserbyEmail };