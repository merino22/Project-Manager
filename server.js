const express = require("express");
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
require("dotenv").config();
const passport = require("passport");
const cors = require("cors");

const initializePassport = require("./passportConfig");
const { static } = require("express");
const { now } = require("jquery");

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

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

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

app.get("/users/MOD-empleados", checkNotAuthenticated, async(req,res)=>{
    try {
        if(req.user.rol === 2){
            console.log(req.isAuthenticated());
            const checkJob = await pool.query(`SELECT e.puesto_trabajo_id_puesto
            FROM usuario u INNER JOIN empleados e ON u.username = e.username
            WHERE u.username = '${req.user.username}'`);
            res.render("MOD-empleados", { user: req.user.nombre, check: checkJob.rows });
            }else{
                res.redirect("dashboard");
            }
    } catch (error) {
        console.log(error.message);
    }
})

app.get("/users/projects", checkNotAuthenticated, async(req, res)=>{
    try {
        if(req.user.rol === 2)
        {
        const projects = await pool.query(`SELECT p.id_proyecto, p.pseudo_nombre, p.fecha_entrega, p.repositorio_github, p.trello, p.equipos_id_equipo, e.puesto_trabajo_id_puesto
        FROM usuario u INNER JOIN empleados e ON u.username = e.username INNER JOIN equipos t 
        ON e.equipos_id_equipo = t.id_equipo INNER JOIN proyecto_aprobado p ON t.id_equipo = p.equipos_id_equipo
        WHERE e.username = '${req.user.username}'`);
        //res.json(projects.rows);
        console.table(projects.rows);
        console.log(req.isAuthenticated());
        res.render("projects", { user: req.user.nombre, projects: projects.rows});
        }else{
            res.redirect("dashboard");
        }
    } catch (error) {
        console.log(error.message)
    }
})

app.get("/users/functionalities", checkNotAuthenticated, async(req, res)=>{
    try {
        if(req.user.rol === 2){
        const checkRole = await pool.query(`SELECT  e.puesto_trabajo_id_puesto FROM usuario u INNER JOIN empleados e ON u.username = e.username
        WHERE u.username = '${req.user.username}'`);
        if(checkRole.rows[0].puesto_trabajo_id_puesto == 'PT-102')
        {
        const functionalities = await pool.query(`SELECT pa.pseudo_nombre, hu.nombre_historia, hu.estado_historia
        FROM usuario u INNER JOIN empleados e ON u.username = e.username
        INNER JOIN equipos eqp ON e.equipos_id_equipo = eqp.id_equipo
        INNER JOIN proyecto_aprobado pa ON eqp.id_equipo = pa.equipos_id_equipo
        INNER JOIN historia_usuario hu ON pa.id_proyecto = hu.proyecto_aprobado_id_proyecto
        WHERE u.username = '${req.user.username}'`);
        res.render("functionalities", {user: req.user.nombre, func: functionalities.rows});
        }else{
            res.redirect("MOD-empleados");
        }
    }else{
        res.redirect("dashboard");
    }
    } catch (error) {
        console.log(error.message);
    }
})

app.get("/users/activities", checkNotAuthenticated, async(req, res)=>{
    if(req.user.rol === 2)
    {
    const activities = await pool.query("SELECT * FROM actividades");
    const projects = await pool.query(`SELECT p.id_proyecto, p.pseudo_nombre, p.fecha_entrega, p.repositorio_github, p.trello, p.equipos_id_equipo, e.puesto_trabajo_id_puesto
        FROM usuario u INNER JOIN empleados e ON u.username = e.username INNER JOIN equipos t 
        ON e.equipos_id_equipo = t.id_equipo INNER JOIN proyecto_aprobado p ON t.id_equipo = p.equipos_id_equipo
        WHERE e.username = '${req.user.username}'`);
    const stories = await pool.query(`SELECT hu.id_historia, hu.proyecto_aprobado_id_proyecto, hu.prioridad, hu.nombre_historia
    FROM usuario u INNER JOIN empleados e ON u.username = e.username INNER JOIN equipos t 
    ON e.equipos_id_equipo = t.id_equipo INNER JOIN proyecto_aprobado p ON t.id_equipo = p.equipos_id_equipo
    INNER JOIN historia_usuario hu ON p.id_proyecto = hu.proyecto_aprobado_id_proyecto
    WHERE e.username = '${req.user.username}'`);
    console.table(activities.rows);
    console.table(projects.rows);
    console.table(stories.rows);
    console.log(req.isAuthenticated());
    res.render("activities", { user: req.user.nombre, act: activities.rows, projects: projects.rows, stories: stories.rows});
    }else{
        res.redirect("dashboard");
    }
})

app.get("/users/test", (req, res)=>{
    res.render("test");
})

app.get("/users/logout", (req,res)=>{
    req.logOut();
    req.flash("success_msg", "Cerraste Sesión");
    res.redirect("/users/login");
})

app.get("/users/activityLog", checkNotAuthenticated, async(req, res)=>{
    try {
        if(req.user.rol === 2)
        {
        console.log(req.isAuthenticated());
        const ownActivities = await pool.query(`SELECT p.pseudo_nombre, act.act_realizada, hu.nombre_historia, act.cant_tiempo_act, emp.equipos_id_equipo, emp.puesto_trabajo_id_puesto
        FROM empleados emp INNER JOIN proyecto_aprobado p ON p.equipos_id_equipo = emp.equipos_id_equipo 
        INNER JOIN historia_usuario hu ON p.id_proyecto = hu.proyecto_aprobado_id_proyecto
        INNER JOIN act_diarias act ON act.historia_usuario_id_historia = hu.id_historia
        INNER JOIN empxact ea ON ea.empleados_id_emp = emp.id_emp
        WHERE emp.username = '${req.user.username}' AND ea.act_diarias_id_act = act.id_act`);

        const coActivities = await pool.query(`SELECT p.pseudo_nombre, act.act_realizada, hu.nombre_historia, u.nombre || ' ' ||  u.apellido AS "Nombre", act.cant_tiempo_act
        FROM usuario u INNER JOIN empleados emp ON u.username = emp.username
        INNER JOIN proyecto_aprobado p ON p.equipos_id_equipo = emp.equipos_id_equipo 
        INNER JOIN historia_usuario hu ON p.id_proyecto = hu.proyecto_aprobado_id_proyecto
        INNER JOIN act_diarias act ON act.historia_usuario_id_historia = hu.id_historia
        INNER JOIN empxact ea ON emp.id_emp = ea.empleados_id_emp
        WHERE emp.equipos_id_equipo = '${ownActivities.rows[0].equipos_id_equipo}' AND u.username != '${req.user.username}' AND ea.act_diarias_id_act = act.id_act`);
        
        res.render("activityLog", { ownAct: ownActivities.rows, coAct: coActivities.rows});
        }else{
            res.redirect("dashboard");
        }
    } catch (error) {
        console.log(error.message);
    }
});

app.post("/users/functionalities", async(req, res)=>{

    let{ statusx, check } = req.body;
    console.log("AQUIIII FIUCK: " + statusx);
    console.log("Check here: " + check);
    if(check == 'In Process'){
        pool.query(`UPDATE historia_usuario SET estado_historia = 'Completed' WHERE nombre_historia = '${statusx}'`);
    }else if(check == 'Completed'){
        pool.query(`UPDATE historia_usuario SET estado_historia = 'In Process' WHERE nombre_historia = '${statusx}'`);
    }
    
    res.redirect("functionalities");
})

app.post('/users/activities', async(req, res)=>{

    const activities = await pool.query("SELECT * FROM actividades");
    const projects = await pool.query(`SELECT p.id_proyecto, p.pseudo_nombre, p.fecha_entrega, p.repositorio_github, p.trello, p.equipos_id_equipo
        FROM usuario u INNER JOIN empleados e ON u.username = e.username INNER JOIN equipos t 
        ON e.equipos_id_equipo = t.id_equipo INNER JOIN proyecto_aprobado p ON t.id_equipo = p.equipos_id_equipo
        WHERE e.username = '${req.user.username}'`);
    const stories = await pool.query(`SELECT hu.id_historia, hu.proyecto_aprobado_id_proyecto, hu.prioridad, hu.nombre_historia
    FROM usuario u INNER JOIN empleados e ON u.username = e.username INNER JOIN equipos t 
    ON e.equipos_id_equipo = t.id_equipo INNER JOIN proyecto_aprobado p ON t.id_equipo = p.equipos_id_equipo
    INNER JOIN historia_usuario hu ON p.id_proyecto = hu.proyecto_aprobado_id_proyecto
    WHERE e.username = '${req.user.username}'`);

    let{ projs, activity, functionality, duration, td1 } = req.body;

    console.log({
        projs,
        activity,
        functionality,
        duration,
        td1
    });
    const id_activity = await pool.query(`SELECT id_act FROM actividades WHERE nombre_act = '${activity}'`);
    console.log(id_activity.rows[0].id_act);
    const id_story = await pool.query(`SELECT id_historia, proyecto_aprobado_id_proyecto FROM historia_usuario WHERE nombre_historia = '${functionality}'`);
    console.log(id_story.rows[0].id_historia);
    console.log(id_story.rows[0].proyecto_aprobado_id_proyecto);
    const proy_select = await pool.query(`SELECT pseudo_nombre FROM proyecto_aprobado WHERE id_proyecto = '${id_story.rows[0].proyecto_aprobado_id_proyecto}'`);
    console.log(proy_select.rows[0].pseudo_nombre);
    const emp = await pool.query(`SELECT id_emp FROM empleados WHERE username = '${req.user.username}'`);
    console.log(emp.rows[0].id_emp);

    let errors = [];

    if(projs != proy_select.rows[0].pseudo_nombre){
        errors.push({ message: "Functionality does not belong to selected project"});
    }

    if(!duration){
        errors.push({ message: "Please insert sprint duration"});
    }

    if(activity == 'otra'){
        if(!td1)
        {
            errors.push( { message: "Please specify activity description"});
        }
    }

    if(errors.length > 0){
        res.render("activities", { user: req.user.nombre, act: activities.rows, projects: projects.rows, stories: stories.rows, errors});//+'?error=' + encodeURIComponent('tenemos errores'));
    }else{
        if(activity == 'otra'){
            pool.query(`INSERT INTO act_diarias( id_act, nombre_pro, act_realizada, cant_tiempo_act,
                historia_usuario_id_historia, fecha_act) VALUES($1, $2, $3, $4, $5, current_date)`, [id_activity.rows[0].id_act, projs, td1, duration, id_story.rows[0].id_historia],
                (err, results)=>{
                    if(err){
                        throw err;
                    }
                    console.log(results.rows);
                    req.flash("success_msg", "Activity correctly submitted");
                    res.redirect(req.get('referer'));
                });

        }else{            
            pool.query(`INSERT INTO act_diarias( id_act, nombre_pro, act_realizada, cant_tiempo_act,
                historia_usuario_id_historia, fecha_act) VALUES($1, $2, $3, $4, $5, current_date)`, [id_activity.rows[0].id_act, projs, activity, duration, id_story.rows[0].id_historia],
                (err, results)=>{
                    if(err){
                        throw err;
                    }
                    console.log(results.rows);
                    req.flash("success_msg", "Activity correctly submitted");
                    res.redirect(req.get('referer'));
                })
        }
        pool.query(`INSERT INTO empxact(empleados_id_emp, act_diarias_id_act) VALUES($1, $2)`, [emp.rows[0].id_emp, id_activity.rows[0].id_act], 
            (err, results)=>{
                if(err){
                    throw err;
                }
                console.log(results.rows);
            });
    }
    console.log({errors});
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

/* Old post for login
app.post("/users/login", passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
    })
);
*/
app.post("/users/login", passport.authenticate("local", {
    failureRedirect: "/users/login"
}), (req, res)=>{
    if(req.user.rol === 1){
        res.redirect("/users/dashboard");
    }
    if(req.user.rol === 2){
        res.redirect("/users/MOD-empleados");
    }
});

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