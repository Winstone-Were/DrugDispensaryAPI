require('dotenv').config();

const express = require('express');
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const session = require("express-session");
const path = require("path");


const app = express();
app.listen(3030,()=>{
    console.log("APP LISTENING ON PORT 3030 !!!")
})
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'stonie',
    password:'123pass', 
    database: 'drugdispensary'
});

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:true,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname,'/static')));
app.use(express.static(path.join(__dirname,'/scripts')))

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname+'pages/login.html'));
});

app.get('/userhome',authenticateToken,(req,res)=>{
    res.sendFile(path.join(__dirname,'pages/userhome.html'));
})

app.post('/auth', (req,res)=>{
    let SSN = req.body.SSN;
    let password = req.body.password;

    if(SSN && password) {
        connection.query('SELECT * FROM patients WHERE SSN = ? AND password = ?', [SSN, password], (error, results, fields)=>{
            if(error) throw error;

            if(results.length > 0) {
                //Give auth and redirect
                //On the front end store the key somewhere

                user = {SSN: results[0].SSN , password: results[0].password};

                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                res.json({accessToken: accessToken});

                

            }

        })
    } 

});

app.get('/profile', authenticateToken, (req,res)=>{

    connection.query('SELECT * FROM patients WHERE SSN = ? AND password = ?', [req.user.SSN, req.user.password], (error, results, fields)=>{
        if(error) throw error;

        if(results.length > 0) {
            //Give auth and redirect
            //On the front end store the key somewhere

            
            //user = {SSN: results[0].SSN , password: results[0].password};
            //console.log(user);

            //const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.json(results);

        }

    })
})

app.get('/login', (req,res)=>{
    res.sendFile(path.join(__dirname+'/pages/login.html'));
})

function authenticateToken(req, res, next ){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if( token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if(err) return res.sendStatus(403);
        req.user = user;

        next();
    });



}


