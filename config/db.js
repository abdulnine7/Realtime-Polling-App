const mongoose = require('mongoose');

//Map global promises
mongoose.Promise = global.Promise;

//Mongoose Connect
mongoose.connect('mongodb://abdul:secretPassword@hostname/cool_db')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
