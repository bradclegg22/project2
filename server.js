const express = require('express');
const bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');
const path = require('path');
const { Pool } = require("pg");
const connectionString = process.env.DATABASE_URL || "postgres://dbuser:brad@localhost:5432/projectdb" || "postgres://mbypnxyisxjsjr:537ffdb222789fab6f0f5ac8b418e5cc5f5b44ceb7daa5e5ad888d99a37157a2@ec2-34-233-226-84.compute-1.amazonaws.com:5432/d3c3o3t4k92eos?ssl=true";
const pool = new Pool({connectionString: connectionString});
const PORT = process.env.PORT || 5000;
const app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/public/static.html'));
});
  app.post('/create', create);
  app.post('/login', login);
  app.post('/addPost', addPost);
  app.listen(PORT, function() {
  console.log('Node app is running on port', PORT);
});

function create(request, response){
    let user = request.body.username;
    let password = request.body.password;
    if (user && password) {
        pool.query("INSERT INTO users(username, password) values($1, $2)", 
    [user, password]);
    }

    response.send("Account created. You can now go back and login.");
    response.end();
    
}

function login(request, response) {
    var username = request.body.username;
	var password = request.body.password;
    if (username && password) {
    pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password], function(error, results) {
    if (results.rows.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.render('result');
			} else {
                response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
};


function addPost(request, response)
{
    
    const post = request.body.blogposts;
    const name = request.body.displayname;
    
    if (post && name){
    pool.query("INSERT INTO blogposts(post, displayname) values($1, $2)", 
    [post, name]);
}
    
    const params = {post: post, name: name};
    response.render('result', params);
    
}

