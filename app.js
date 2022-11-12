const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const databasePath = path.join(__dirname, "twitterClone.db");
const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server is Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertStateDbObjectToResponseObject = (dbObject) => {
  return {
    username: dbObject.username,
    password: dbObject.password,
    name: dbObject.name,
    gender: dbObject.gender,
  };
};
// API 1
app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const postRegisterQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const databaseUser = await database.get(postRegisterQuery);

  if (databaseUser !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    if (password.length < 6) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const registerNewUser = `INSERT INTO user (username, password, name, gender) 
            VALUES ('${username}', '${hashedPassword}', '${name}', '${gender}')`;

      await database.run(registerNewUser);
      response.status(200);
      response.send("User created successfully");
    }
  }
});

// API 2
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const postLoginQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const databaseUser = await database.get(postLoginQuery);

  if (databaseUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
      const isPasswordMatched = await bcrypt.compare(
      password,
      databaseUser.password

    if (isPasswordMatched === true) {
      response.status(400);
      response.send("Invalid password");
    } else {
      const loginNewUser = `INSERT INTO user (username, password) 
            VALUES ('${username}', '${hashedPassword}')`;

      await database.run(LoginNewUser);
      response.status(200);
      response.send({ jwtToken });
    }
  }
});

// Authenticate with JWT Token
function authenticateToken(request, response, next) {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  }
}
// API 3
app.get("/user/tweets/feed/", async (request, response) => {
    const getUserQuery = `SELECT * FROM tweet;`;
    const tweetArray = await database.all(getUserQuery);
    response.send(tweetArray.map((eachTweet) => convertStateDbObjectToResponseObject(eachTweet)
    )
    );
})

// API 4
app.get("/user/following/", async (request, response) => {
    const getUsersQuery = `SELECT * FROM user;`;

    const getUserArray = await database.get(getUsersQuery);
    response.send(getUserArray.map((eachUser) => convertStateDbObjectToResponseObject(eachUser)
    )
    );
})
// API 5
app.get("/user/followers/", async (request, response) => {
    const getUsername = `SELECT * FROM user;`;

    const getUsernameArray = await database.get(getUsername);
    response.send(getUserArray.map((eachName) => convertStateDbObjectToResponseObject(eachName)
    )
    );
}

// API 6
app.get("/tweets/:tweetId/", async (request, response) => {

})


module.exports = app;
