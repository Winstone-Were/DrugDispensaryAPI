require('dotenv').config();

const express = require('express');
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const session = require("express-session");
const path = require("path");
const { error } = require('console');


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
app.use(express.static(path.join(__dirname,'/scripts')));
app.use(express.static(path.join(__dirname,'/public')));


app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname,'pages/login.html'));
});

app.get('/signup', (req,res)=>{
    res.sendFile(path.join(__dirname,'pages/signup.html'));
});

app.get('/admin-add-drug', (req,res)=>{
    res.sendFile(path.join(__dirname, 'pages/admin-add-drug.html'));
})

app.get('/admin-search', (req,res)=>{
    res.sendFile(path.join(__dirname, 'pages/admin-search.html'));
})

app.get('/userhome',(req,res)=>{

    if(req.session.loggedIn){
        res.sendFile(path.join(__dirname,'pages/userhome.html'));        
    }else{
        res.sendStatus(403);
    }

});

app.get('/adminhome',(req,res)=>{

    if(req.session.loggedIn){
        res.sendFile(path.join(__dirname,'pages/adminhome.html'));        
    }else{
        res.sendStatus(403);
    }

});


app.post('/auth', (req,res)=>{
    let SSN = req.body.SSN;
    let password = req.body.password;

    let stop = false;

    if(SSN && password) {
        connection.query('SELECT * FROM patients WHERE SSN = ? AND password = ?', [SSN, password], (error, results, fields)=>{
            if(error) throw error;

            if(results.length > 0) {
                stop = true;
                //Give auth and redirect
                //On the front end store the key somewhere

                connection.query('UPDATE patients SET lastLoggedIn = ? WHERE SSN = ? ', [new Date, SSN], (error,results,fields)=>{
                    if(error) throw error;
                })

                req.session.loggedIn = true;
                user = {SSN: results[0].SSN , password: results[0].password};

                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                res.json({accessToken: accessToken, userType: 'user'});

            }

        })
        if(!stop) {
            //look for User in Admins
            connection.query('SELECT * FROM admins where SSN = ? AND password = ?', [SSN, password], (error, results, fields)=>{
                if(error) throw error;

                if(results.length > 0) {
                    req.session.loggedIn = true;
                    user = {SSN: results[0].SSN, password: results[0].password};
                    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                    res.json({accessToken: accessToken, userType:'admin'});
                }
            })
        }
    } 

});

app.get('/profile', authenticateToken, (req,res)=>{

    //console.log(req.user);  

    connection.query('SELECT * FROM patients WHERE SSN = ? AND password = ?', [req.user.SSN, req.user.password], (error, results, fields)=>{
        if(error) throw error;

        if(results.length > 0) {

            console.log(results);
            res.json(results);

        }

    })
})

app.get('/getProfile/:SSN',authenticateToken,(req,res)=>{

    console.log(req.params);    
    connection.query('SELECT * FROM patients WHERE SSN = ?',[req.params.SSN],(error, results, fields)=>{
        if(error) throw error;
        if(results.length > 0){
            console.log(results)
            res.json(results);
        }
    });
});

app.get('/getProfileByEmail/:email',(req,res)=>{
    connection.query('SELECT * FROM patients WHERE email = ?', [req.params.email], (error, results, fields)=>{
        if(error) throw error;
        if(results.length >0){
            res.json(results);
        }
    });
});

app.get('/getProfileByDrug/:drugId',(req,res)=>{

    connection.query('SELECT * FROM dispensed_prescriptions WHERE drug_ID = ?', [req.params.drugId], (error, results, fields)=>{
        if(error) throw error;
        if(results.length > 0){
            let data = {patient_SSN: null, patientName: null, drugID: null , drugName : null ,dateDispensed: null }
            data.dateDispensed = results[0].dateDispensed;
            let patientId = results[0].patient_SSN;
            connection.query('SELECT * FROM drugs WHERE drug_id = ?', [req.params.drugId], (error, results, fields)=>{
                if(error) throw error;
                if(results.length > 0){
                    data.drugID = req.params.drugId;
                    data.drugName = results[0].drug_name;


                    connection.query('SELECT * FROM patients WHERE SSN = ? ', [patientId], (error, results, fields)=>{
                        if(error) throw error;
                        if(results.length > 0){
                            data.patient_SSN =  patientId;
                            data.patientName = `${results[0].Fname} ${results[0].Lname}`;
                        }
                        res.json([data]);
                    });
                }
            });
            
        }else{
            res.send('Not Found lol');
        }
    })
});

app.get('/getProfileByPurchaseDate',authenticateToken, (req,res)=>{
    let date = req.body.date;
    connection.query('SELECT * FROM dispensed_prescriptions WHERE dateDispensed = ?', [date], (error, results, fields)=>{
        if(error) throw error;
        if(results.length>0){
            let data = {patient_SSN: null, patientName: null, drugID: null , drugName : null ,dateDispensed: null }
            data.dateDispensed = results[0].dateDispensed;
            let patientId = results[0].patient_SSN;
            let drugId = results[0].drug_ID;
            connection.query('SELECT * FROM drugs WHERE drug_id = ?', [drugId], (error, results, fields)=>{
                if(error) throw error;
                if(results.length > 0){
                    data.drugID = req.params.drugId;
                    data.drugName = results[0].drug_name;


                    connection.query('SELECT * FROM patients WHERE SSN = ? ', [patientId], (error, results, fields)=>{
                        if(error) throw error;
                        if(results.length > 0){
                            data.patient_SSN =  patientId;
                            data.patientName = `${results[0].Fname} ${results[0].Lname}`;
                        }
                        res.json(data);
                    });
                }
            });
        }
    })
});

app.get('/getProfileByLastLogin',(req,res)=>{
    connection.query('SELECT * FROM patients ORDER BY lastLoggedIn',[], (error,results,fields)=>{
        if(error) throw error;
        if(results.length > 0){
            res.json(results);
        }
    });
});

app.get('/getProfileByGender',(req,res)=>{
    connection.query('SELECT * FROM patients ORDER BY gender',[], (error,results,fields)=>{
        if(error) throw error;
        if(results.length > 0){
            res.json(results);
        }
    });
});

app.get('/login', (req,res)=>{
    res.sendFile(path.join(__dirname+'/pages/login.html'));
});

app.post('/addDrug',authenticateToken, (req,res)=>{
    console.log(req.body);
    let drug_id = req.body.drug_id;
    let drug_formula = req.body.drug_formula;
    let drug_name = req.body.drug_name;
    let quantity = req.body.quantity;
    let price = req.body.price;

    connection.query('INSERT INTO drugs(drug_id, drug_formula, drug_name, quantity, price_per_unit) VALUES(?, ?, ?, ?, ?)',[drug_id, drug_formula, drug_name, quantity, price], (error,result, fields )=>{
        if(error) throw error;
        res.json({state: "success"});
    });

});

app.post('/updateDrug',authenticateToken, (req,res)=>{
    console.log(req.body);
    let drug_id = req.body.drug_id;
    let drug_formula = req.body.drug_formula;
    let drug_name = req.body.drug_name;
    let quantity = req.body.quantity;
    let price = req.body.price;

    connection.query('UPDATE drugs SET drug_formula = ?,drug_name = ?,quantity = ?, price_per_unit = ? WHERE drug_id = ? ',[drug_id, drug_formula, drug_name, quantity, price], (error,result, fields )=>{
        if(error) throw error;
        res.json({state: "success"});
    });

});

app.get('/drugs', authenticateToken,(req, res) => {
    connection.query('SELECT * FROM drugs', function(err, result, fields){
        res.json(result);
    });
});

app.get('/drugs/:drug_id', authenticateToken, (req, res) => {
    const drugId = req.params.drug_id;

    connection.query('SELECT * FROM drugs WHERE drug_id = ?', [drugId], function (err, result, fields) {
        if (err) throw err;

        if (result.length > 0) {
            res.json(result); 

        } else {
            res.status(404).json({ message: 'Drug not found' });
        }
    });
});

app.get('/drugs/by-category/:drug_category', (req, res) => {
    const drugCategory = req.params.drug_category;

    console.log(drugCategory);
    
    connection.query('SELECT * FROM drugs WHERE drug_formula = ?', [drugCategory], function (err, result, fields) {
        if (err) throw err;

        if (result.length > 0) {
            res.json(result);
        } else {
            res.status(404).json({ message: 'No drugs found for the given category' });
        }
    });
});

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

function authenticateTokenFromParams(req, res, next){
    const token = req.param("token");
    console.log(token);
    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if(err) {
            return res.sendStatus(403);
            console.log(err);
        }
        req.user = user;

        next();
    })
}

app.get('/testparams/:token', (req,res)=>{
    console.log(req.params.token);
})

