const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const User = mongoose.model('users', mongoose.Schema(usersSchema));

// Definisikan skema untuk model LoginAttempt
const loginAttemptSchema = new mongoose.Schema({
  email: { type: String, required: true },
  attempts: { type: Number, required: true, default: 0 },
  lastAttempt: { type: Date, required: true, default: Date.now }
});

// Buat model LoginAttempt dari skema
const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);


module.exports = {
  mongoose,
  User,
  LoginAttempt
};
