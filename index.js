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

const userSchema = mongoose.Schema({
  username: String,
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(BASE_URL);
});

app.post('/api/users', async (req, res) => {
  await User.create({ username: req.body.username });
  const userQuery = await User.findOne({ username: req.body.username });
  const { username, _id } = userQuery;
  res.send({ username, _id });
});

app.get('/api/users', async (req, res) => {
  const usersQuery = await User.find();
  res.send(
    usersQuery.map((user) => ({ username: user.username, _id: user._id }))
  );
});

app.listen(process.env.PORT || 3000);
