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

const currentTime = new Date();

const exerciseScheme = mongoose.Schema({
  description: String,
  duration: Number,
  date: Date,
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseScheme);

app.get('/', (req, res) => {
  res.sendFile(BASE_URL);
});

app.post('/api/users', async (req, res) => {
  const user = await User.create({ username: req.body.username });
  const { username, _id } = user;
  res.send({ username, _id });
});

app.get('/api/users', async (req, res) => {
  const usersQuery = await User.find();
  res.send(
    usersQuery.map((user) => ({ username: user.username, _id: user._id }))
  );
});

// To Delete Later On
app.get('/api/delete', async (req, res) => {
  await User.deleteMany();
  await Exercise.deleteMany();

  res.redirect('/');
});

app.post('/api/:_id/exercises', async (req, res) => {
  const { _id, description, duration, date } = req.body;

  try {
    const user = await User.findOne({ _id });

    const exercise = await Exercise.create({
      description,
      duration,
      date,
    });

    res.send({
      username: user.username,
      _id: user._id,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise?.date || currentTime.toUTCString().slice(0, 16),
    });
  } catch (err) {
    res.send({ error: 'invalid user Id' });
  }
});

app.listen(process.env.PORT || 3000);
