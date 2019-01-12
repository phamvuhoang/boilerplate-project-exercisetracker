const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
// mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )
mongoose.connect('mongodb://fcc:fcc123@ds157522.mlab.com:57522/fcc')

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

var User = require('./helper.js').UserModel;

// I can create a user by posting form data username to /api/exercise/new-user 
// and returned will be an object with username and _id.
const createUser = require('./helper.js').createUser;
app.route('/api/exercise/new-user')
.get(function(req, res) {
  res.json({error: 'no GET allow here'})
})
.post(function(req, res) {
  createUser(req.body.username, function(err, user) {
    if (err) return res.json({error: err});

    if(!user) {
      return res.json({error: 'Something went wrong'});
    }
    
    return res.json({usercreated: user.username});
  })
})

// I can get an array of all users by getting api/exercise/users 
// with the same info as when creating a user.
const getAllUsers = require('./helper.js').getAllUsers;
app.get('/api/exercise/users', function(req, res) {
  getAllUsers(function(err, users) {
    if (err) return res.json({error: err});
    
    if (!users) return res.json({error: 'Something went wrong'});
    
    return res.json(users);
  })
})

// I can add an exercise to any user by posting form data 
// userId(_id), description, duration, and optionally date to /api/exercise/add. 
// If no date supplied it will use current date. 
// Returned will the the user object with also with the exercise fields added.
const createExercise = require('./helper.js').createExercise;
app.post('/api/exercise/add', function(req, res) {
  createExercise(
    req.body.userId, 
    req.body.description, 
    req.body.duration, 
    req.body.date, 
    function(err, data) {
      if (err) return res.json({error: err});
      
      if (!data) {
        return res.json({error: 'Something went wront'});
      }
      
      return res.json({data});
    }
  );
})

// I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id). 
// Return will be the user object with added array log and count (total exercise count).
// I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
// GET /api/exercise/log?{userId}[&from][&to][&limit]
const getExerciseLog = require('./helper.js').getExerciseLog;
app.get('/api/exercise/log', function(req, res) {
  getExerciseLog(
    req.query.userId, 
    req.query.from, 
    req.query.to, 
    req.query.limit, 
    function(err, data) {
      if (err) return res.json(err);
      
      return res.json(data);
    }
  );
})

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage
  console.log('error handling: ' + err);
  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
