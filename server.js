const express = require('express');
const bodyParser = require('body-parser');
var session = require('express-session');
const ejs = require('ejs');
const path = require('path');
const { Pool } = require("pg");
const connectionString = process.env.DATABASE_URL || "postgres://dbuser:brad@localhost:5432/projectdb";
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
    var post = [];
    var posts = [];
    pool.query("SELECT post FROM blogposts", function (err, result, fields) {
    if (err) { 
        throw err;
    }
    else {
         
     post = result.rows.map(a => a.post);

    
}
        callback(request, response, username, password, post);
   
});
}

    function callback(request, response, username, password, post) {
    if (username && password && post) {
    pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password], function(error, results) {
    if (results.rows.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
                console.log(post);
                const params = {post: post};
				response.render('result', params);
			} else {
                response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
}


function addPost(request, response)
{
    
    const posts = request.body.blogposts;
    
    if (posts){
    pool.query("INSERT INTO blogposts(post) values($1)", 
    [posts]);
}
    
   response.send('Your post as been added you can now go back and refresh the page to view your post');
}



