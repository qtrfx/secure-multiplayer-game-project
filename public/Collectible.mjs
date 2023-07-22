class Collectible {
  constructor({x, y, value}) {
    this.x = x,
    this.y = y,
    this.value = value
    this.radius = 10
    this.colors = {
      1: 'brown',
      2: 'grey',
      3: 'gold',
      4: 'orange',
      5: 'lightblue'}
  }

  draw(context) {
    context.fillStyle = this.colors[this.value]
    context.strokeStyle = 'black'
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    context.fill()
    context.stroke()
    
  }
}
  

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
