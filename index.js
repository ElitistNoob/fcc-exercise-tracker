const mongoose = require('mongoose').default;
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const BASE_URL = `${__dirname}/views/index.html`;
const app = express();
const { MONGO_URI } = process.env;

mongoose.connect(MONGO_URI);

app.use(express.static('public'));
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(BASE_URL);
});

app.listen(process.env.PORT || 3000);
