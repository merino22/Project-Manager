const express = require("express");
const app = express()
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
require("dotenv").config();
const passport = require("passport");
const cors = require("cors")

const initializePassport = require("./passportConfig");
const { static } = require("express");
const { now } = require("jquery")
const { render } = require("ejs");

initializePassport(passport);

const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));
var id_cli = 0;
var equipo = "team";
var id_proy = 0;
var id_soli = 0;
var pres = 0;
var tempUser = "us";
var tempCliId = 1;
app.use(session({
    secret: 'secret',

    resave: false,

    saveUninitialized: false
})
);
//Usuario Temporal para editar
var tempun = "user";
var tempnom = "nom";
var tempape = "apellido";
var temppass = "contra";
var tempfn = "fech";
var tempemail = "correo";
var tempdp = "pais";
var tempdciudad = "city";
var tempdcalle = "calle";
var temprol = 0;
//--------------------------
//Temporal Equipo
var tempequi = "equipo";
var tempidequi = 0;
//--------------------------
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

app.use(flash());

app.get("/", (req, res) => {
    res.render("index");
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
var us = "def";
app.get("/users/solicitud", checkNotAuthenticated, (req, res) => {
    if(req.user.rol === 1){
        res.render("sol_proy.ejs", {user: req.user.nombre});
        us = req.user.username;
    }else 
        res.render("dashemp", { user: req.user.nombre});
});

app.get("/users/register", checkNotAuthenticated, (req,res)=>{
    res.render("register.ejs", {user: req.user.nombre});
});

app.get("/users/form_aprobar", checkNotAuthenticated, (req,res)=>{
    res.render("form_aprobar.ejs", {user: req.user.nombre});
});
app.get("/users/crear_equipo", checkNotAuthenticated, (req,res)=>{
    res.render("crear_equipo.ejs", {user: req.user.nombre});
});
app.get("/users/editar_usuario", checkNotAuthenticated, (req,res)=>{
    res.render("editar_usuario.ejs", {user: req.user.nombre, usuario:tempun, nombre:tempnom, apellido:tempape, contraseña:temppass, correo:tempemail, fecha_nac:tempfn, country:tempdp, city:tempdciudad, street:tempdcalle, role:temprol});
});
app.get("/users/agregar_tel", checkNotAuthenticated, (req,res)=>{
    res.render("agregar_tel.ejs", {user: req.user.nombre});
});

app.get("/users/editar_proyecto", checkNotAuthenticated, async (req,res)=>{
    try {
        const teams = await pool.query(`SELECT * FROM equipos`)
        console.table(teams.rows);
        res.render("editar_proyecto.ejs", {user:req.user.nombre, teams:teams.rows});
    } catch (error) {
        console.log(error.message);
    }
    
});

app.get("/users/proys_sol", checkNotAuthenticated, async  (req,res)=>{
    try{
        const projects = await pool.query(`SELECT * FROM solicitud_proyecto sp WHERE sp.cliente_id_cliente = '${id_cli}'`);
        console.table(projects.rows);
        res.render("proys_sol.ejs", {user:req.user.nombre, projects:projects.rows});
    }catch (error){
        console.log(error.message);
    }
});
app.get("/users/crear_historia", checkNotAuthenticated, (req,res)=>{
    res.render("crear_historias.ejs", {user:req.user.nombre});
});
app.get("/users/manejar_solis", checkNotAuthenticated, async  (req,res)=>{
    try{
        const projects = await pool.query(`SELECT * FROM solicitud_proyecto WHERE estado_solicitud = 'pendiente'`);
        console.table(projects.rows);
        res.render("manejar_solis.ejs", {user:req.user.nombre, projects:projects.rows});
    }catch (error){
        console.log(error.message);
    }
});
app.get("/users/ver_proyectos_aprobados", checkNotAuthenticated, async  (req,res)=>{
    try{
        const projects = await pool.query(`SELECT * FROM proyecto_aprobado pa FULL OUTER JOIN equipos e ON e.id_equipo = pa.equipos_id_equipo WHERE pa.id_proyecto IS NOT NULL`);
        console.table(projects.rows);
        res.render("ver_proyectos_aprobados.ejs", {user:req.user.nombre, projects:projects.rows});
    }catch (error){
        console.log(error.message);
    }
});
app.get("/users/manejar_usuarios", checkNotAuthenticated, async  (req,res)=>{
    try{
        const usuarios = await pool.query(`SELECT * FROM usuario`);
        const telefonos = await pool.query(`SELECT * FROM telefonos`);
        console.table(usuarios.rows);
        res.render("manejar_usuarios.ejs", {user:req.user.nombre, usuarios:usuarios.rows, telefonos:telefonos.rows});
    }catch (error){
        console.log(error.message);
    }
});
app.get("/users/manejar_clientes", checkNotAuthenticated, async  (req,res)=>{
    try{
        const usuarios = await pool.query(`SELECT * FROM cliente`);
        console.table(usuarios.rows);
        for (let index = 0; index < usuarios.rows.length; index++) {
            const element = usuarios.rows[index].username;
            console.log(element);
        }
        res.render("manejar_clientes.ejs", {user:req.user.nombre, usuarios:usuarios.rows});
    }catch (error){
        console.log(error.message);
    }
});
app.get("/users/ver_info_cliente", checkNotAuthenticated, async  (req,res)=>{
    try{
        const usuarios = await pool.query(`SELECT * FROM cliente`);
        const solicitudes = await pool.query(`SELECT sp.nombre_pro FROM cliente c INNER JOIN solicitud_proyecto sp ON c.id_cliente=sp.cliente_id_cliente WHERE c.id_cliente = '${tempCliId}'`);
        const proyectos = await pool.query(`SELECT pa.pseudo_nombre FROM cliente c INNER JOIN solicitud_proyecto sp ON c.id_cliente=sp.cliente_id_cliente INNER JOIN proyecto_aprobado pa ON sp.id_solicitud=pa.solicitud_proyecto_id_solicitud WHERE c.id_cliente = '${tempCliId}' `);
        const historias = await pool.query(`SELECT hu.nombre_historia FROM cliente c INNER JOIN historia_usuario hu ON c.id_cliente=hu.cliente_id_cliente WHERE c.id_cliente = '${tempCliId}' `);
        console.table(usuarios.rows);
        res.render("ver_info_cliente.ejs", {user:req.user.nombre, usuarios:usuarios.rows, solicitudes:solicitudes.rows, proyectos:proyectos.rows, historias:historias.rows});
    }catch (error){
        console.log(error.message);
    }
});
app.get("/users/ver_equipos", checkNotAuthenticated, async  (req,res)=>{
    try{
        const equipos = await pool.query(`SELECT * FROM equipos`);
        console.table(equipos.rows);
        res.render("ver_equipos.ejs", {user:req.user.nombre, equipos:equipos.rows});
    }catch (error){
        console.log(error.message);
    }
});
app.get("/users/asignar_jefe", checkNotAuthenticated, async  (req,res)=>{
    try{
        const jefes = await pool.query(`SELECT * FROM empleados WHERE puesto_trabajo_id_puesto = 'PT-102' AND equipos_id_equipo IS NULL`);
        console.table(jefes.rows);
        res.render("asignar_jefe.ejs", {user:req.user.nombre, jefes:jefes.rows});
    }catch (error){
        console.log(error.message);
    }
});
app.get("/users/asignar_miembros", checkNotAuthenticated, async  (req,res)=>{
    try{
        const miembros = await pool.query(`SELECT * FROM empleados WHERE NOT puesto_trabajo_id_puesto = 'PT-102' AND equipos_id_equipo IS NULL`);
        console.table(miembros.rows);
        res.render("asignar_miembros.ejs", {user:req.user.nombre, miembros:miembros.rows});
    }catch (error){
        console.log(error.message);
    }
});
app.get("/users/aprobados", checkNotAuthenticated, async  (req,res)=>{
    try{
        var check = 0;
        let empleadosArray = [];
        const projects = await pool.query(`SELECT * FROM solicitud_proyecto sp INNER JOIN proyecto_aprobado pa ON sp.id_solicitud = pa.solicitud_proyecto_id_solicitud WHERE sp.cliente_id_cliente = '${id_cli}' AND estado_solicitud='aprobado'`);
        for (let i = 0; i < projects.rows.length; i++) {
            check = await pool.query(`select e.username, u.nombre, u.apellido from empleados e inner join usuario u on e.username = u.username where e.equipos_id_equipo = '${projects.rows[i].equipos_id_equipo}'`);
            console.log("Now check this out");
            for (let index = 0; index < check.rows.length; index++) {
            console.log(check.rows[index].username);
            console.log(check.rows[index].nombre);
            var a = check.rows[index].nombre;
            var all = a.concat(" ", check.rows[index].apellido);
            console.log(check.rows[index].nombre);
            console.log(all);
            empleadosArray.push(all);
            }
        }
        console.log("CHECK2");
        console.log(empleadosArray[0]);
        console.log(empleadosArray[1]);
        console.table(projects.rows);
        res.render("aprobados.ejs", {user:req.user.nombre, projects:projects.rows, empleadosArray:empleadosArray});
    }catch (error){
        console.log(error.message);
    }
});
app.get("/users/rechazados", checkNotAuthenticated, async  (req,res)=>{
    try{
        const projects = await pool.query(`SELECT * FROM solicitud_proyecto sp WHERE sp.cliente_id_cliente = '${id_cli}' AND estado_solicitud='rechazado'`);
        console.table(projects.rows);
        res.render("rechazados.ejs", {user:req.user.nombre, projects:projects.rows});
    }catch (error){
        console.log(error.message);
    }
});

app.get("/users/login", checkAuthenticated, (req,res)=>{
    res.render("login.ejs");
});

app.get("/users/dashboard", checkNotAuthenticated, (req,res)=>{
    console.log(req.isAuthenticated());
    if(req.user.rol === 1){
        pool.query(
            `SELECT * FROM cliente
            WHERE username = $1`, [req.user.username], (err, results) =>{
                if (err){
                    throw err;
                }
                id_cli = results.rows[0].id_cliente;
            }
        )
        return res.render("dashboard", { user: req.user.nombre});
    }
    if(req.user.rol === 2)
        return res.render("dashemp", { user: req.user.nombre});
    if(req.user.rol === 3)
        return res.render("dashadmin", { user: req.user.nombre});
    
});

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
    let { username, email, password, password2, name, apellido, fecha, pais, ciudad, calle, rol } = req.body;

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
        calle,
        rol
    });

    let errors = [];

    if(!username || !email || !password || !password2 || !name || !apellido || !fecha || !pais || !ciudad || !calle || !rol){
        errors.push({message: "Porfavor ingrese todos los campos!"});
    }

    if(password.length < 4){
        errors.push({message: "La contraseña debe ser de al menos 4 caracteres"});
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
                        RETURNING username, password`, [username, hashedPassword, name, apellido, fecha, email, pais, ciudad, calle, rol], (err, results)=>{
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
app.post('/users/editar_usuario', async (req,res)=>{
    let { username, email, password, password2, name, apellido, fecha, pais, ciudad, calle } = req.body;

    var datenac = new Date(fecha);
    var fea = datenac.toISOString().split('T')[0];
    console.log({
        username,
        email,
        password,
        password2,
        name,
        apellido,
        fea,
        pais,
        ciudad,
        calle
    });

    let errors = [];

    if(!username || !email || !password || !password2 || !name || !apellido || !fecha || !pais || !ciudad || !calle){
        errors.push({message: "Porfavor ingrese todos los campos!"});
    }

    if(password.length < 4){
        errors.push({message: "La contraseña debe ser de al menos 4 caracteres"});
    }

    if(password != password2){
        errors.push({message: "Las contraseñas no concuerdan"});
    }

    if(errors.length > 0){
        res.render("editar_usuario.ejs", { errors })
    }else{
        //Form validation has passed

        let hashedPassword = await bcrypt.hash(password,10);
        console.log(hashedPassword);

        
                    pool.query(
                        `UPDATE usuario SET username = '${username}', password = '${hashedPassword}', nombre = '${name}', apellido = '${apellido}', fecha_nacimiento = '${fea}', email = '${email}', direc_pais = '${pais}', direc_ciudad = '${ciudad}', direc_calle = '${calle}' WHERE username = '${tempun}'`
                        
                    );
                    res.redirect("/users/manejar_usuarios");
    }

});
app.post('/users/crear_historia', (req,res)=>{
    let { nom_his, prioridad, descripcion } = req.body;

    console.log({
        nom_his,
        prioridad,
        descripcion
    });

    let errors = [];

    if(!nom_his || !prioridad || !descripcion){
        errors.push({message: "Porfavor ingrese todos los campos!"});
    }

    if(errors.length > 0){
        res.render("crear_historias.ejs", { errors })
    }else{
        //Form validation has passed
        
       

        pool.query(
            `SELECT * FROM historia_usuario
            WHERE nombre_historia = $1`, [nom_his], (err, results) =>{
                if (err){
                    throw err;
                }

                console.log(results.rows);
                if(results.rows.length > 0){
                    errors.push({message: "Ya existe una historia igual"});
                    res.render("crear_historias.ejs", {errors});
                }else{
                    pool.query(
                        `INSERT INTO historia_usuario (nombre_historia, prioridad, descripcion, cliente_id_cliente, proyecto_aprobado_id_proyecto, equipos_id_equipo, estado_historia )
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING nombre_historia, descripcion`, [nom_his, prioridad, descripcion, id_cli, id_proy, equipo, "Idle"], (err, results)=>{
                            if(err){
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "Haz agregado la historia con éxito, puedes hacer otra si lo deseas.");
                            res.redirect("/users/solicitud");
                        }
                    );
                }
            }
        )
    }

});
app.post('/users/form_aprobar', (req,res)=>{
    let { pseudo_nombre, repo, trello } = req.body;

    console.log({
        pseudo_nombre,
        repo,
        trello,
        id_soli,
        pres
    });

    const solBig = BigInt(id_soli);
    var newDate = new Date();

    let errors = [];

    if(!pseudo_nombre || !repo || !trello){
        errors.push({message: "Porfavor ingrese todos los campos!"});
    }

    if(errors.length > 0){
        res.render("form_aprobar.ejs", { errors })
    }else{
        //Form validation has passed
        
       

        pool.query(
            `SELECT * FROM proyecto_aprobado
            WHERE pseudo_nombre = $1`, [pseudo_nombre], (err, results) =>{
                if (err){
                    throw err;
                }

                console.log(results.rows);
                if(results.rows.length > 0){
                    errors.push({message: "Ya aprobaste ese proyecto"});
                    res.render("form_aprobar.ejs", {errors});
                }else{
                   /* pool.query(
                        `INSERT INTO proyecto_aprobado (pseudo_nombre, estado_proyecto, fecha_creacion, repositorio_github, trello, solicitud_proyecto_id_solicitud, presupuesto)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING pseudo_nombre, estado_proyecto`, [pseudo_nombre, "not yet assigned", newDate, repo, trello, id_soli, pres], (err, results)=>{
                            if(err){
                                throw err;
                            }
                            console.log(results.rows);
                            
                            res.redirect("/users/dashboard");
                        }
                    );*/
                    pool.query(
                        `UPDATE solicitud_proyecto SET estado_solicitud = 'aprobado' WHERE id_solicitud = '${id_soli}'`
                    );
                    pool.query(
                        `UPDATE proyecto_aprobado SET pseudo_nombre = '${pseudo_nombre}', repositorio_github = '${repo}', trello = '${trello}' WHERE solicitud_proyecto_id_solicitud = '${id_soli}'`
                        
                    );
                    res.redirect("/users/dashboard");
                }
            }
        )
    }

});
app.post('/users/form_aprobar', (req,res)=>{
    let { pseudo_nombre, repo, trello } = req.body;

    console.log({
        pseudo_nombre,
        repo,
        trello,
        id_soli,
        pres
    });

    const solBig = BigInt(id_soli);
    var newDate = new Date();

    let errors = [];

    if(!pseudo_nombre || !repo || !trello){
        errors.push({message: "Porfavor ingrese todos los campos!"});
    }

    if(errors.length > 0){
        res.render("form_aprobar.ejs", { errors })
    }else{
        //Form validation has passed
        
       

        pool.query(
            `SELECT * FROM proyecto_aprobado
            WHERE pseudo_nombre = $1`, [pseudo_nombre], (err, results) =>{
                if (err){
                    throw err;
                }

                console.log(results.rows);
                if(results.rows.length > 0){
                    errors.push({message: "Ya aprobaste ese proyecto"});
                    res.render("form_aprobar.ejs", {errors});
                }else{
                   /* pool.query(
                        `INSERT INTO proyecto_aprobado (pseudo_nombre, estado_proyecto, fecha_creacion, repositorio_github, trello, solicitud_proyecto_id_solicitud, presupuesto)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING pseudo_nombre, estado_proyecto`, [pseudo_nombre, "not yet assigned", newDate, repo, trello, id_soli, pres], (err, results)=>{
                            if(err){
                                throw err;
                            }
                            console.log(results.rows);
                            
                            res.redirect("/users/dashboard");
                        }
                    );*/
                    pool.query(
                        `UPDATE solicitud_proyecto SET estado_solicitud = 'aprobado' WHERE id_solicitud = '${id_soli}'`
                    );
                    pool.query(
                        `UPDATE proyecto_aprobado SET pseudo_nombre = '${pseudo_nombre}', repositorio_github = '${repo}', trello = '${trello}' WHERE solicitud_proyecto_id_solicitud = '${id_soli}'`
                        
                    );
                    res.redirect("/users/dashboard");
                }
            }
        )
    }

});
app.post('/users/editar_proyecto', (req,res)=>{
    var fecha_entrega = req.body.fecha_entrega;
    var equi = req.body.equipos;
    var fecha_asignacion = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    var fea = fecha_asignacion.toISOString().split('T')[0];

    console.log({
        fecha_entrega,
        equi,
        fecha_asignacion
    });
    let errors = [];

    if(!fecha_entrega || !equi){
        errors.push({message: "Porfavor ingrese todos los campos!"});
    }

    if(errors.length > 0){
        res.render("editar_proyecto.ejs", { errors })
    }else{

                    pool.query(
                        `UPDATE proyecto_aprobado SET estado_proyecto = 'assigned', fecha_asignacion = '${fea}', fecha_entrega = '${fecha_entrega}', equipos_id_equipo = '${equi}' WHERE id_proyecto = '${id_proy}'`
                        
                    );
                    res.redirect("/users/ver_proyectos_aprobados");
                }
            
        
});
app.post('/users/solicitud', (req,res)=>{
    let { nom_proy, presupuesto, descripcion } = req.body;

    console.log({
        nom_proy,
        presupuesto,
        descripcion
    });

    let errors = [];

    if(!nom_proy || !presupuesto || !descripcion){
        errors.push({message: "Porfavor ingrese todos los campos!"});
    }

    if(errors.length > 0){
        res.render("sol_proy", { errors })
    }else{
        //Form validation has passed
        
       

        pool.query(
            `SELECT * FROM solicitud_proyecto
            WHERE nombre_pro = $1`, [nom_proy], (err, results) =>{
                if (err){
                    throw err;
                }

                console.log(results.rows);
                if(results.rows.length > 0){
                    errors.push({message: "Ya existe un proyecto con ese nombre"});
                    res.render("sol_proy", {errors});
                }else{
                    pool.query(
                        `INSERT INTO solicitud_proyecto (nombre_pro, descripcion, estado_solicitud, cliente_id_cliente, presupuesto )
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING nombre_pro, descripcion`, [nom_proy, descripcion, "pendiente", id_cli, presupuesto], (err, results)=>{
                            if(err){
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "Haz realizado la solicitud con éxito, puedes hacer otra si lo deseas.");
                            res.redirect("/users/solicitud");
                        }
                    );
                }
            }
        )
    }

});

app.post("/users/proys_sol", (req, res) => {
    var but = req.body.custId;
    console.log({but});
    pool.query(
        `SELECT * FROM solicitud_proyecto sp WHERE sp.cliente_id_cliente = '${id_cli}' AND id_solicitud = '${but}'`, (err, results) =>{
            if (err){
                throw err;
            }
            console.table(results.rows);
            
        }
    )
    res.redirect("/users/dashboard");
})
app.post("/users/aprobados", (req, res) => {
    var but = req.body.ProyId;
    id_proy = but;
    equipo = req.body.EquipoId;
    console.log(id_cli);
    console.log({but});
    console.log(equipo);
    console.log(id_proy);
    pool.query(
        `SELECT * FROM historia_usuario hu WHERE hu.cliente_id_cliente = '${id_cli}' AND proyecto_aprobado_id_proyecto = '${but}'`, (err, results) =>{
            if (err){
                throw err;
            }
            console.table(results.rows);
            
        }
    )
    res.redirect("/users/crear_historia");
})
app.post("/users/manejar_solis", (req, res) => {
    var but = req.body.SoliId;
    id_soli = but;
    var boton = req.body.but;
    pres = req.body.presupuesto;
    console.log(id_soli);
    console.log("El valor del boton es: ");
    console.log(boton);
    console.log(but);
    console.log(pres);
    var com = boton.localeCompare("Aceptar");
    if (com === 0) {
        pool.query(
            `SELECT * FROM solicitud_proyecto sp WHERE sp.id_solicitud = '${id_soli}'`, (err, results) =>{
                if (err){
                    throw err;
                }
                console.table(results.rows);
                
            }
        )
        res.redirect("/users/form_aprobar");
    }else if (com != 0) {
        pool.query(
            `UPDATE solicitud_proyecto SET estado_solicitud = 'rechazado' WHERE id_solicitud = '${id_soli}'`
        );
        res.redirect("/users/dashboard");
    }
    
});

app.post("/users/ver_proyectos_aprobados", (req, res) => {
    var but = req.body.ProyId;
    var boton = req.body.but;
    id_proy = but;
    pres = req.body.presupuesto;
    console.log(id_soli);
    console.log("El valor del boton es: ");
    console.log(boton);
    console.log(but);
    var com = boton.localeCompare("Editar");
    if (com === 0) {
        pool.query(
            `SELECT * FROM proyecto_aprobado WHERE id_proyecto = '${but}'`, (err, results) =>{
                if (err){
                    throw err;
                }
                console.table(results.rows);
                
            }
        )
        res.redirect("/users/editar_proyecto");
    }else if (com != 0) {
        pool.query(
            `UPDATE solicitud_proyecto SET estado_solicitud = 'rechazado' WHERE id_solicitud = '${id_soli}'`
        );
        res.redirect("/users/dashboard");
    }
    
});
app.post("/users/manejar_clientes", (req, res) => {
    var but = req.body.idcli;
    var boton = req.body.but;
    tempCliId = but;
    console.log("El valor del boton es: ");
    console.log(boton);
    console.log(but);
    var com = boton.localeCompare("Editar");
    if (com === 0) {
        pool.query(
            `SELECT * FROM proyecto_aprobado WHERE id_proyecto = '${but}'`, (err, results) =>{
                if (err){
                    throw err;
                }
                console.table(results.rows);
                
            }
        )
        res.redirect("/users/editar_proyecto");
    }else if (com != 0) {
        pool.query(
            `SELECT sp.nombre_pro FROM cliente c INNER JOIN solicitud_proyecto sp ON c.id_cliente=sp.cliente_id_cliente WHERE c.id_cliente = '${but}' `, (err, results) =>{
                if (err){
                    throw err;
                }
                console.table(results.rows);
                
            }
        );
        pool.query(
            `SELECT pa.pseudo_nombre FROM cliente c INNER JOIN solicitud_proyecto sp ON c.id_cliente=sp.cliente_id_cliente INNER JOIN proyecto_aprobado pa ON sp.id_solicitud=pa.solicitud_proyecto_id_solicitud WHERE c.id_cliente = '${but}' `, (err, results) =>{
                if (err){
                    throw err;
                }
                console.table(results.rows);
                
            }
        );
        pool.query(
            `SELECT hu.nombre_historia FROM cliente c INNER JOIN historia_usuario hu ON c.id_cliente=hu.cliente_id_cliente WHERE c.id_cliente = '${but}' `, (err, results) =>{
                if (err){
                    throw err;
                }
                console.table(results.rows);
                
            }
        );
        res.redirect("/users/ver_info_cliente");
    }
    
});
app.post("/users/manejar_usuarios", (req, res) => {

    let {un, pass, nom, ape, fn, email, dp, dciudad, dcalle, rol} = req.body;
    console.log({
        un,
        nom,
        ape, 
        pass, 
        fn,
        email, 
        dp, 
        dciudad, 
        dcalle, 
        rol
    });
    tempun = un;
    tempnom = nom;
    tempape = ape;
    temppass = pass;
    tempfn = fn;
    tempemail = email;
    tempdp = dp;
    tempdciudad = dciudad;
    tempdcalle = dcalle;
    temprol = rol;
    var but = req.body.un;
    var boton = req.body.but;
    tempUser = but;
    console.log("El valor del boton es: ");
    console.log(boton);
    console.log(but);
    var com = boton.localeCompare("Editar");
    if (com === 0) {
        pool.query(
            `SELECT * FROM usuario WHERE username = '${but}'`, (err, results) =>{
                if (err){
                    throw err;
                }
                console.table(results.rows);
                
            }
        )
        res.redirect("/users/editar_usuario");
    }else if(boton === "Eliminar"){
        console.log("You can delete the user: ");
        console.log(un);
        pool.query(
            `DELETE FROM usuario WHERE username = '${un}'`
        );
        res.redirect("/users/manejar_usuarios");
    }else if(boton === "Agregar Tel"){
        res.redirect("/users/agregar_tel");
    }
    
});
app.post("/users/rechazados", (req, res) => {
    var but = req.body.SoliId;
    console.log("El id de la solicitud es: ");
    console.log(but);
    pool.query(
        `SELECT * FROM solicitud_proyecto sp WHERE sp.id_solicitud = '${but}'`, (err, results) =>{
            if (err){
                throw err;
            }
            console.table(results.rows);
            
        }
    )
    pool.query(
        `UPDATE solicitud_proyecto SET estado_solicitud = 'pendiente' WHERE id_solicitud = '${but}' `
    )
    res.redirect("/users/dashboard");
});
app.post("/users/crear_equipo", (req, res) => {
    var but = req.body.nom_equipo;
    console.log("El nombre del equipo es: ");
    console.log(but);
    pool.query(
                    `INSERT INTO equipos (nombre_equipo)
                        VALUES ($1)
                        RETURNING nombre_equipo`, [but], (err, results)=>{
            if (err){
                throw err;
            }
            console.table(results.rows);
            
        }
    )
    res.redirect("/users/dashboard");
});
app.post("/users/agregar_tel", (req, res) => {
    var but = req.body.num_tel;
    console.log("El numero que ingresaste es: ");
    console.log(but);
    console.log("El usuario que usaras es: ");
    console.log(tempun);
    pool.query(
                    `INSERT INTO telefonos (numero_tel, usuario_username)
                        VALUES ($1, $2)
                        RETURNING numero_tel`, [but, tempun], (err, results)=>{
            if (err){
                throw err;
            }
            console.table(results.rows);
            res.redirect("/users/manejar_usuarios");
        }
    )
    
});
app.post("/users/ver_equipos", (req, res) => {
    var but = req.body.nom_equipo;
    var idequi = req.body.idequi;
    var boton = req.body.but;
    tempequi = but;
    tempidequi = idequi;
    console.log("El nombre del equipo es: ");
    console.log(but);
    console.log(boton);
    var com = boton.localeCompare("Asignar Jefe");
    if(com === 0){
        pool.query(
                        `SELECT * FROM equipos WHERE id_equipo = '${idequi}'`, (err, results)=>{
                if (err){
                    throw err;
                }
                console.table(results.rows);

            }
        )
        res.redirect("/users/asignar_jefe");
    }else if(com != 0){
        res.redirect("/users/asignar_miembros");
    }
});
app.post("/users/asignar_jefe", (req, res) => {
    var but = req.body.jefes;
    console.log("El id del empleado es: ");
    console.log(but);
    console.log("El id del equipo es: ");
    console.log(tempidequi);
    pool.query(
        `SELECT * FROM empleados WHERE id_emp = '${but}'`, (err, results) =>{
            if (err){
                throw err;
            }
            console.table(results.rows);
            
        }
    )
    pool.query(
        `UPDATE empleados SET equipos_id_equipo = '${tempidequi}' WHERE id_emp = '${but}' `
    )
    res.redirect("/users/ver_equipos");
});
app.post("/users/asignar_miembros", (req, res) => {
    var but = req.body.miembros;
    console.log("El id del empleado es: ");
    console.log(but);
    console.log("El id del equipo es: ");
    console.log(tempidequi);
    pool.query(
        `SELECT * FROM empleados WHERE id_emp = '${but}'`, (err, results) =>{
            if (err){
                throw err;
            }
            console.table(results.rows);
            
        }
    )
    pool.query(
        `UPDATE empleados SET equipos_id_equipo = '${tempidequi}' WHERE id_emp = '${but}' `
    )
    res.redirect("/users/asignar_miembros");
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
function checkNotAuthenticatedClient(req,res,next){
    if(req.isAuthenticated() && req.user.rol === 1){
        return next()
    }
    res.redirect("/users/login");
}

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});