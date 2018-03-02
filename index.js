const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const morgan     = require('morgan');
var jwt          = require('jsonwebtoken');
// set the view engine to ejs
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// use morgan to log requests to the console
app.use(morgan('dev'));
let skills = require("./skills.json");

// normally would be a database but we will be using hard coding
// to avoid database setup
let user = {
    username: "demo",
    password: "demo"
}

app.set('superSecret', {'secret': 'ilovescotchyscotch'});

app.get('/', (req, res) => {
    res.render('home',{skills:skills.skills});
})


app.get('/api/auth', (req, res) => {
    res.render('auth',{skills:skills.skills});
})

app.post('/api/auth', (req, res) => {
    if (!user) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else{
        if (user.password != req.body.password) {
            res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {
            let payload = {
                user: user.username
            };

            var token = jwt.sign(payload, app.get('superSecret').secret, {
                expiresIn: 1440 // expires in 24 hours
            });

            res.json({
                skills: "GET http://localhost:3000/api/skills",
                success: true,
                message: 'Enjoy your token! Please use postman using token={tokenid}',
                token: token
            });
        }
    }
})

app.use("/api",function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret').secret, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided. Go to: http://localhost:3000/api/auth'
    });

  }
});


app.get('/api/skills', (req, res) => {
    res.json(skills);
})

app.listen(3000, () => console.log('Example app listening on port http://localhost:3000!'))