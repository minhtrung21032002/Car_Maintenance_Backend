//Import
const express = require('express')
const handlebars = require('express-handlebars')
const path = require('path')
const app = express()
const port = 3000
const cors = require('cors');
const route = require('./routes/index')
const db = require('./config/db/index')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const request = require('request');
const exphbs = require('express-handlebars');


// request.get({
//   url: 'https://api.api-ninjas.com/v1/cars',
//   headers: {
//     'X-Api-Key': 'mUBn8/nwF1DtadpxUFTpJw==d4KgfE7GUrFLDMqm'
//   },
// }, function(error, response, body) {
//   if(error) return console.error('Request failed:', error);
//   else if(response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
//   else console.log(body)
// });


//Cookie Config
app.use(cookieParser());

//Session Config
app.use(session({
  secret: 'minhtrung', // Replace with a strong secret key
  resave: true,
  saveUninitialized: true,
}));



// Connect DataBase
db.connect()


// Serve File Middleware
app.use(express.static(path.join(__dirname, 'assets')))

// Serve Javascript Files
app.use(express.static(path.join(__dirname, 'front_end')))

// Serve config
app.use(express.static(path.join(__dirname, 'config')))

app.use(express.static(path.join(__dirname, '../node_modules')))






// Parse Middleware (req.body)
app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())

// Use Handlebars
const hbs = exphbs.create({
  helpers: {
    statusClass: function(status) {
      return status === 'Active' ? 'text-success' : 'text-fail';
    }
  },
  defaultLayout: 'main', // If you are using a default layout
  extname: '.handlebars' // Setting the default extension for templates
});

// Register Handlebars as the view engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Set the views directory
app.set('views', path.join(__dirname, 'resources/views'));

app.use(cors({
  origin: '*',
  methods: 'OPTIONS,GET,POST,PUT,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization',
}));


// Router init
route(app)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




