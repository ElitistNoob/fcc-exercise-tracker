const mongoose = require('mongoose').default;
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Schema, model } = require('mongoose');
require('dotenv').config();

const BASE_URL = `${__dirname}/views/index.html`;
const app = express();
const { MONGO_URI } = process.env;

mongoose.connect(MONGO_URI);

app.use(express.static('public'));
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const formatDate = (date) => {
  if (date) {
    return new Date(date).toUTCString();
  }
  return new Date().toUTCString();
};

const userSchema = new Schema({
  username: String,
  count: {
    type: Number,
    default: 0,
  },
  log: [
    {
      description: String,
      duration: Number,
      date: Date,
    },
  ],
});
const User = model('User', userSchema);

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

  res.redirect('/');
});

app.post('/api/:_id/exercises', async (req, res) => {
  const { _id, description, duration, date } = req.body;

  try {
    const user = await User.findOne({ _id });

    const exercise = {
      description,
      duration,
      date,
    };

    await user.log.push(exercise);
    user.save();

    res.send({
      username: user.username,
      _id: user._id,
      description: exercise.description,
      duration: exercise.duration,
      date: formatDate(exercise.date).slice(0, 16),
    });
  } catch (err) {
    res.send({ error: 'invalid user Id' });
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;

  const user = await User.find({ _id });

  res.send({
    username: user[0].username,
    _id: user[0]._id,
    count: user[0].log.length,
    log: user[0].log.map((i) => ({
      description: i.description,
      duration: i.duration,
      date: formatDate(i.date).slice(0, 16),
    })),
  });
});

app.listen(process.env.PORT || 3000);
