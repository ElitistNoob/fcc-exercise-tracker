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

const formatDateToUTC = (date) => new Date(date).toUTCString().slice(0, 16);

const filterLogs = (from, to, log) => {
  const minDate = from ? new Date(from) : -Infinity;
  const maxDate = to ? new Date(to) : Infinity;
  const logDate = log.date;

  if (logDate >= minDate && logDate <= maxDate) {
    return log;
  }
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

userSchema.pre('save', function (next) {
  if (!this.log[0].date) {
    this.log[0].date = Date.now();
  }
  next();
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id, description, duration, date } = req.body;

  try {
    const user = await User.findOne({ _id });

    const exercise = {
      description,
      duration,
      date: date || Date.now(),
    };

    await user.log.push(exercise);
    user.save();

    res.send({
      _id: user._id,
      username: user.username,
      date: formatDateToUTC(exercise.date),
      duration: exercise.duration,
      description: exercise.description,
    });
  } catch (err) {
    res.send({ error: 'invalid user Id' });
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = await User.findOne({ _id });

  const filteredLogs = user.log
    .filter((i) => filterLogs(from, to, i))
    .slice(0, limit);

  res.send({
    _id: user._id,
    username: user.username,
    count: filteredLogs.length,
    log: filteredLogs.map((i) => ({
      description: i.description,
      duration: i.duration,
      date: formatDateToUTC(i.date),
    })),
  });
});

app.listen(process.env.PORT || 3000);
