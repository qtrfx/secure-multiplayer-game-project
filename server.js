require('dotenv').config();
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const expect = require('chai');
const cors = require('cors');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');


const http = require('http').createServer(app);
const io = require('socket.io')(http)

const Collectible = require('./public/Collectible')
const Player = require('./public/Player').default
const { HEIGHT, WIDTH, SPEED, PADDING_LEFT, PADDING_RIGHT, PADDING_BOTTOM, PADDING_TOP } = require('./public/constants.mjs')


// Initialise gamestate and create a new collectible with a random x y position
// and value from 1 to 5

function sortRanks(ranks) {
  ranks.sort( (a,b) => {
      if( a.score < b.score) {
          return 1;
      }
      if( a.score > b.score) {
          return -1;
      }
      return 0;
  })
}

const gameState = {
  collectible: new Collectible(
    {
      x: Math.floor(Math.random() * 800 + 50),
      y: Math.floor(Math.random() * 500 + 50),
      value: Math.floor(Math.random() * 5 + 1)
    }),
  players: {},
  connectedPlayers: 0,
  ranks: []
}


io.on('connection', (client) => {

  // Get ID of connected client
  const { id } = client

  // Add to playercount on each connection
  gameState.connectedPlayers++
  console.log(`User ${client.id} has connected`)

  // Assign a new player for each connection
  gameState.players[id] = new Player(
    { 
      x: Math.floor(Math.random() * 800 + 25), 
      y: Math.floor(Math.random() * 500 + 25),
      id: id,
      sequenceNumber: 0,
      score: 0
    })

  gameState.ranks.push({score: gameState.players[id].score, id: gameState.players[id].id})
  sortRanks(gameState.ranks)


  // Remove player if they disconnect
  client.on('disconnect', () => {
    gameState.connectedPlayers--
    delete gameState.players[id]
    const yep = gameState.ranks.findIndex(index => {
      console.log(index)
      return index.id == id
    })
    gameState.ranks.splice(yep, yep + 1)
    console.log(`User ${client.id} has disconnected.`)
  })

  // Listen for keydown events from player
  client.on('keydown', ({ sequenceNumber, keyDict }) => {
    gameState.players[id].sequenceNumber = sequenceNumber
    gameState.players[id].movePlayer(keyDict, SPEED)
    if(gameState.players[id].checkCollectibleCapture(gameState.collectible)) {
      gameState.players[id].score += gameState.collectible.value
      gameState.collectible = new Collectible(
        {
          x: Math.floor(Math.random() * 800 + 50),
          y: Math.floor(Math.random() * 500 + 50),
          value: Math.floor(Math.random() * 5 + 1)
        })
      gameState.ranks = []
      Object.entries(gameState.players).forEach(player => {
        gameState.ranks.push({score: player[1].score, id: player[0]})
      })
      sortRanks(gameState.ranks)

    }
    
  })
})

// Send updated gamestate every 15 milliseconds to all clients
setInterval(() => {
  io.emit('gameUpdate', gameState)
}, 15)



app.use(helmet.xssFilter())
app.use(helmet.noSniff())
app.use(helmet.noCache())
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3'}))

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({ origin: '*' }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = http.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
