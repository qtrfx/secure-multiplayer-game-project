import { HEIGHT, WIDTH, PADDING_TOP, PADDING_BOTTOM, PADDING_LEFT, PADDING_RIGHT } from './constants.mjs'

class Player {
  constructor({x, y, id, w, h, sequenceNumber}) {
    this.x = x,
    this.y = y,
    this.w = 40
    this.h = 40
    this.score = 0
    this.id = id
    this.dx = 0
    this.dy = 0
    this.sequenceNumber = sequenceNumber

  }

  movePlayer(keyDict, speed) {
    if(!keyDict) return
    this.dx = 0
    this.dy = 0

    
    if(keyDict.KeyW) this.dy += -speed
    if(keyDict.KeyA) this.dx += -speed
    if(keyDict.KeyS) this.dy += speed
    if(keyDict.KeyD) this.dx += speed

    this.collision()

    this.x += this.dx
    this.y += this.dy

    return {dx: this.dx, dy: this.dy}


  }

  collision() {
    if(this.x + this.dx < PADDING_LEFT) {
      this.dx = 0
      this.x = PADDING_LEFT }
    else if(this.x + this.w + this.dx > WIDTH - PADDING_RIGHT) {
       this.dx = 0
       this.x = WIDTH - this.w - PADDING_RIGHT
    }
    if(this.y + this.dy < PADDING_TOP) {
      this.dy = 0
      this.y = PADDING_TOP}
    else if(this.y + this.h + this.dy > HEIGHT - PADDING_BOTTOM){

     this.dy = 0
     this.y = HEIGHT - this.h - PADDING_BOTTOM
    }

  }

  checkCollectibleCapture(collectible) {
    const distanceX = Math.abs(collectible.x - this.x - this.w / 2);
    const distanceY = Math.abs(collectible.y - this.y - this.h / 2)


    if(distanceX <= (this.w / 2) && distanceY <= (this.h / 2)) {
      return true;
    }
    else {
      return false;
    }
  }

  calculateRank(arr) {

  }

  draw(context, id, images) {
    if(id == this.id) {
      //context.fillStyle = 'gold'
      context.drawImage(images.playerImage, this.x, this.y, this.w, this.h)
    }
    else {
      //context.fillStyle = 'red'
      context.drawImage(images.opponentImage, this.x, this.y, this.w, this.h)
    }
     //context.fillRect(this.x, this.y, this.w, this.h)
    //context.strokeStyle = 'black'
    //context.strokeRect(this.x, this.y, this.w, this.h)
 

  }
}

export default Player;
