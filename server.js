const express = require("express");
const app = express()
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
require("dotenv").config();
const passport = require("passport");


const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));

app.use(session({
    secret: 'secret',

    resave: false,

    saveUninitialized: false
})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/users/register", checkAuthenticated, (req,res)=>{
    res.render("register.ejs");
});

app.get("/users/login", checkAuthenticated, (req,res)=>{
    res.render("login.ejs");
});

app.get("/users/dashboard", checkNotAuthenticated, (req,res)=>{
    console.log(req.isAuthenticated());
    res.render("dashboard", { user: req.user.nombre});
});

app.get("/users/logout", (req,res)=>{
    req.logOut();
    req.flash("success_msg", "Cerraste Sesión");
    res.redirect("/users/login");
})

app.post('/users/register', async (req,res)=>{
    let { username, email, password, password2, name, apellido, fecha, pais, ciudad, calle } = req.body;

    console.log({
        username,
        email,
        password,
        password2,
        name,
        apellido,
        fecha,
        pais,
        ciudad,
        calle
    });

    let errors = [];

    if(!username || !email || !password || !password2 || !name || !apellido || !fecha || !pais || !ciudad || !calle){
        errors.push({message: "Porfavor ingrese todos los campos!"});
    }

    if(password.length < 6){
        errors.push({message: "La contraseña debe ser de al menos 6 caracteres"});
    }

    if(password != password2){
        errors.push({message: "Las contraseñas no concuerdan"});
    }

    if(errors.length > 0){
        res.render("register", { errors })
    }else{
        //Form validation has passed

        let hashedPassword = await bcrypt.hash(password,10);
        console.log(hashedPassword);

        pool.query(
            `SELECT * FROM usuario
            WHERE username = $1`, [username], (err, results) =>{
                if (err){
                    throw err;
                }

                console.log(results.rows);
                if(results.rows.length > 0){
                    errors.push({message: "Email already registered"});
                    res.render("register", {errors});
                }else{
                    pool.query(
                        `INSERT INTO usuario (username, password, nombre, apellido, fecha_nacimiento, email, direc_pais, direc_ciudad, direc_calle, rol)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        RETURNING username, password`, [username, password, name, apellido, fecha, email, pais, ciudad, calle, 1], (err, results)=>{
                            if(err){
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "Ya estas registrado, inicia sesión.");
                            res.redirect("/users/login");
                        }
                    );
                }
            }
        )
    }

});

app.post("/users/login", passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
    })
);

function checkAuthenticated(req,res, next){
    if(req.isAuthenticated()){
        return res.redirect("/users/dashboard");
    }
    next();
}
function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/users/login");
}

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});