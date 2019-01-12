/** Install & Set up mongoose */
/*  ====================== */
const mongoose = require('mongoose');
mongoose.connect(process.env.MLAB_URI);

/** # SCHEMAS and MODELS #
/*  ====================== */

const Schema = mongoose.Schema;

/** Create a 'User' Model */
const userSchema = new Schema({
  username: String,
  exerciseIds: [String]
});
const User = mongoose.model('User', userSchema);

/** Create an 'Exercise' Model */
const exerciseSchema = new Schema({
  userId: String,
  description: String,
  duration: Number,
  date: String
});
const Exercise = mongoose.model('Exercise', exerciseSchema);


const createUser = function(username, done) {
  // Myself logic: check if username already exist
  User.findOne({username}, function(err, matched) {
    if (matched) return done('Username already exist');
  })
  
  const user = new User({
    username,
    exercises: []
  });
  
  user.save(function(err, user) {
    if (err) return done(err);
    
    return done(null, user);
  });
}

const getAllUsers = function(done) {
  User.find({}, function(err, users) {
    if (err) return done(err);
    
    return done(null, users);
  })
}

const addExerciseToUser = function(exerciseId, userId, done) {
  User.findById(userId, function(err, user) {
    if (err) return done(err);

    user.exerciseIds.push(exerciseId);
    user.save(function(err, user) {
      if (err) return done(err);
      
      return done(null, user);
    });
  })
}

const createExercise = function(userId, description, duration, date, done) {
  if (!userId || !description || !duration) return done('Required field not inputed');
  
  let exerciseDate = date;
  if (!date) {
    exerciseDate = new Date().toISOString().substring(0,10);
  }
  
  const exercise = new Exercise({
    userId,
    description,
    duration,
    date: exerciseDate
  });
  
  exercise.save(function(err, data) {
    if (err) return done(err);
  
    addExerciseToUser(data._id, userId, function(err, user) {
      if (err) return done(err);
      
      return done(null, user);
    });
  });
}

const getExerciseLog = function(userId, from, to, limit, done) {
  let query = {
    userId: userId
  }
  if (from) query.date = {$gte: from};
  if (from && to) query.date = {$gte: from, $lte: to};
  if (!from && to) query.date = {$lte: to};
  
  console.log(query);
  if (limit) {
    Exercise.find(query)
    .limit(parseInt(limit))
    .exec(function(err, data) {
      if (err) done(err);
      done(null, data);
    });
  } else {
    Exercise.find(query, function(err, data) {
      if (err) done(err);
      done(null, data);
    });
  }
}

exports.UserModel = User;
exports.ExerciseModel = Exercise;
exports.createUser = createUser;
exports.getAllUsers = getAllUsers;
exports.createExercise = createExercise;
exports.getExerciseLog = getExerciseLog;