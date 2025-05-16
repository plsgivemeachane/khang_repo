const express = require("express");
const PORT = 4000
const path = require("path");
const route = require('./routes/index');
const flash = require('express-flash');
const expressLayouts = require('express-ejs-layouts');


const cookieParser = require('cookie-parser'); 
const session = require('express-session');
const database = require("./config/database");


const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser('IH12345')); 
app.use(
  session({
    secret: 'IH12345',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);
app.use(flash());
app.use(expressLayouts)
app.set('layout', './layout/root')
database()
route(app);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});