function generateRandomString() {
  let x = uuid();
  return x.substring(0, 6);
}

const getUserByEmail = (email, users) => {
  for (const userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = (id, urlDatabase) => {
  const userUrls = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      userUrls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return userUrls
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser }

