const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (email, password, done) => {
    console.log(email, password);
    pool.query(
      `SELECT * FROM usuario WHERE username = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          const user = results.rows[0];
          const hp = bcrypt.hashSync(user.password,10);

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.log(err);
            }
            if (isMatch) {
              return done(null, user);
            } else {
              //password is incorrect
              return done(null, false, { message: "Contraseña incorrecta" });
            }
          });
        } else {
          // No user
          return done(null, false, {
            message: "No existe tal usuario"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "username", passwordField: "password" },
      authenticateUser
    )
  );

  passport.serializeUser((user, done) => done(null, user.username));

  passport.deserializeUser((username, done) => {
    pool.query(`SELECT * FROM usuario WHERE username = $1`, [username], (err, results) => {
      if (err) {
        return done(err);
      }
      console.log(`Role is ${results.rows[0].rol}`);
      console.log(`ID is ${results.rows[0].username}`);
      return done(null, results.rows[0]);
    });
  });
}

module.exports = initialize;