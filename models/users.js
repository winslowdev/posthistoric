const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true, unique: true}
});

const User = mongoose.model('Contributors', userSchema);

module.exports = User;
