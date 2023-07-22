import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import { HEIGHT, WIDTH, SPEED, PADDING_LEFT, PADDING_TOP, PADDING_RIGHT, PADDING_BOTTOM } from './constants.mjs'

const playerImage = document.getElementById('player')
const opponentImage = document.getElementById('opponent')

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const gameState = {
    players: {}
}



socket.on('gameUpdate', (backEndGameState) => {
    const { collectible, connectedPlayers, players, ranks } = backEndGameState
    if (backEndGameState.collectible) {
        gameState.collectible = new Collectible({
            x: collectible.x,
            y: collectible.y,
            value: collectible.value
        })
    }
    gameState.connectedPlayers = connectedPlayers
    gameState.ranks = ranks

    for (const frontEndPlayer in gameState.players) {
        if (!players[frontEndPlayer]) {
            delete gameState.players[frontEndPlayer]
        }
    }

    for (const player in players) {
        const { x, y, score, id } = players[player]
        if (!gameState.players[player]) {
            gameState.players[player] = new Player({ x, y, score, id })
            continue
        }
        gameState.players[player].score = score
                                   
        if(gameState.players[player].id == socket.id) {
            const lastIndex = playerInputs.findIndex(index => {
                return index.sequenceNumber == backEndGameState.players[player].sequenceNumber
            })
            if(lastIndex > -1 ) {
                let dx = 0
                let dy = 0
                playerInputs.splice(0, lastIndex + 1)
                playerInputs.forEach(movement => {
                    dx += movement.dx
                    dy += movement.dy
                    
                    
                })
                gameState.players[player].x = x + dx
                gameState.players[player].y = y + dy
            }
        }
         else {
            gameState.players[player].x = x 
            gameState.players[player].y = y
        } 
      }
})


function drawGame() {

    // Clear canvas each frame
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the canvas background
    context.fillStyle = '#5c5348'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#48515c'
    context.fillRect(PADDING_LEFT, PADDING_TOP, canvas.width - PADDING_LEFT - PADDING_RIGHT, canvas.height - PADDING_TOP - PADDING_BOTTOM)

    // Draw the playfield border
    context.lineWidth = 2
    context.strokeRect(PADDING_LEFT, PADDING_TOP, canvas.width - PADDING_RIGHT * 2, canvas.height - PADDING_TOP * 2)

    // Draw game title
    context.fillStyle = 'white'
    context.font = "20px 'Press Start 2P'"
    context.textBaseline = 'middle'
    context.textAlign = 'center'
    context.fillText('Coin Hunt', WIDTH / 2, PADDING_TOP / 2)
    context.textBaseline = 'bottom'
    context.fillText('Controls: WASD', WIDTH / 2, HEIGHT - 5)

    context.lineWidth = 1


    if (gameState.players[socket.id]) {
        const playerRankIndex = gameState.ranks.findIndex(index => {
            return index.id == socket.id
        })

        context.textAlign = 'left'
        context.fillText(`Score: ${gameState.players[socket.id].score}`, PADDING_LEFT, HEIGHT - 5)
        context.textAlign = 'right'
        context.fillText(`Rank: ${playerRankIndex + 1}/${gameState.connectedPlayers}`, WIDTH - PADDING_RIGHT, HEIGHT - 5)
        for (let player in gameState.players) {
            gameState.players[player].draw(context, socket.id, { playerImage, opponentImage })
            if (gameState.collectibe) {
                if (gameState.players[player].checkCollectibleCapture(gameState.collectible)) {
                    delete gameState.collectible
                }
            }
        }
    }

    if (gameState.collectible) {
        gameState.collectible.draw(context)

    }
    requestAnimationFrame(drawGame)
}



drawGame()



const keyDict = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,

}
function keyListener(event) {
    const { code, type } = event
    if (keyDict.hasOwnProperty(code)) {
        type == 'keydown'
            ? keyDict[code] = true
            : keyDict[code] = false;
    }


}
let playerInputs = []
let sequenceNumber = 0
setInterval(() => {
    if (!gameState.players[socket.id]) return


    if (keyDict.KeyW || keyDict.KeyA || keyDict.KeyS || keyDict.KeyD) {

        const newInput = gameState.players[socket.id].movePlayer(keyDict, SPEED)
        sequenceNumber++
        newInput.sequenceNumber = sequenceNumber
        playerInputs.push(newInput)
        socket.emit('keydown', { sequenceNumber, keyDict })
    }

}, 15)


document.addEventListener('keydown', keyListener)
document.addEventListener('keyup', keyListener)


