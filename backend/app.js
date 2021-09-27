const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// cryptage email //
require('dotenv').config()

// avoid SQL injections //
const mongoSanitize = require('express-mongo-sanitize');

// avoid XSS injection //
const helmet = require("helmet");
app.use(helmet());

// Rate limiting //
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 10 requests per windowMs
  message: "Trop de requêtes, veuillez réessayer après 15 minutes."
});
app.use(limiter);

const sauceRoutes = require('./routes/sauce')

const userRoutes = require('./routes/user');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  next()
});

const mongooseConnect= `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@go-fullstack.74vdo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
mongoose.connect(mongooseConnect,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes)
app.use('/api/auth', userRoutes);

module.exports = app;