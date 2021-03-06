const params = new URLSearchParams(window.location.search)
const playerId = params.get('playerId')
const players = JSON.parse(params.get('players')) //array of all player
let readyPlayers = {};
let mainExecuted = false


let gameEnded = false
let playerScores = {}
let readyState = false; //true if all players are ready
playerScores[playerId] = -1000

let finished = false

let type = "WebGL"
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas"
}

PIXI.utils.sayHello(type)


//Main game
//Create a Pixi Application
const app = new PIXI.Application({
  height: innerHeight,
  width: innerWidth,
  antialias: true,
  backgroundColor: 0xffffff
});
document.body.appendChild(app.view);

// Scale mode for all textures, will retain pixelation
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

//load assets (images) into the local cache

//init loader and
const loader = PIXI.loader;

//load assets and on Complete run setup()
loader
  // .add('click_here', 'assets/click_here.png')
  .load(setup)


//game setup function
function setup() {
  //setup readyPlayers Object
  for (let player in players) {
    readyPlayers[player] = false;
  }


  window.addEventListener('message', msg => {
    if (msg.data.source === 'minigame') {
      if (msg.data.playerId !== playerId) {
        playerScores[msg.data.playerId] = msg.data.score
      }

      if (testStart(msg.data)) {
        readyState = true;
        console.log("all ready")
        if (!mainExecuted) main();
        if (!readyState) {
          console.log("not all clients are ready!")
        }
      }
      console.log(playerScores)
      testWin()
    }
  })


  parent.postMessage({
    source: 'minigame',
    playerId,
    score: playerScores[playerId],
    ready: true,
  }, '*')

}


function main() {
  mainExecuted = true

  const startTime = Date.now()
  let gameDuration = -1
  const color1 = 0x95CDB8
  const cWhite = 0xffffff
  const cGray = 0xC5C5C5

  const centerX = innerWidth / 2


// fixed triangle (0.0 is for transparent)
  const triangle1 = new PIXI.Graphics
  triangle1.beginFill(cWhite, 0.0)
  triangle1.lineStyle(7, color1)
  let width = 260
  let height = 400
  let posX = centerX - width / 2
  let posY = 100
  triangle1.drawPolygon([
    posX, posY,
    posX + width, posY,
    posX + (width / 2), posY + height
  ])
  triangle1.endFill()
  app.stage.addChild(triangle1)


  const rect1 = new PIXI.Graphics
  rect1.beginFill(cGray)
  rect1.drawRect((innerWidth / 2) - 160, 576, 320, 133)
  rect1.endFill()
  app.stage.addChild(rect1)
  rect1.interactive = true
  rect1.buttonMode = true
  rect1.on("pointerdown", onclick)

  const textStyle = new PIXI.TextStyle({
    fontFamily: 'pixelsplitterregular',
    fontSize: 36
  })

/*
  const text = new PIXI.Text("Click me", textStyle)
  text.anchor.set(0.5)
  text.x = (innerWidth / 2)
  text.y = 642
  app.stage.addChild(text)
*/

  const clickHere = new PIXI.Sprite.from('assets/ClickHere.png')
  clickHere.anchor.set(0.5)
  clickHere.x = (innerWidth / 2)
  clickHere.y = 642
  app.stage.addChild(clickHere)


  // todo: set the step-size for the filling rate:
  const step = 20

  const startX = innerWidth / 2
  let lineY = posY + height
  let lineWidth = 0;


  function onclick() {
    if (lineY <= posY) {
      // finished the game:
      finished = true
      gameDuration = Date.now() - startTime
      console.log(`You filled the triangle after ${gameDuration}ms`)
      playerScores[playerId] = 1_000_000 - gameDuration
      updateClients()
    }
    else {
      // just draw a line - simulating the growth of the triangle:
      const line = new PIXI.Graphics
      line.lineStyle(step, color1)
      lineWidth += width / 400 * step
      lineY -= step
      line.moveTo(startX - lineWidth / 2, lineY)
      line.lineTo(startX + lineWidth / 2, lineY)
      app.stage.addChild(line)
    }
  }
}




function updateClients(){

  parent.postMessage({
    source: 'minigame',
    playerId,
    score: playerScores[playerId],
  }, '*')

  console.log(`updateClients finished. playerId: ${playerId}, playerScores[playerId]: ${playerScores[playerId]}`)
}

// todo: methods imported from 'tap100'
function testStart(data){
  //console.log("testing ready")
  readyPlayers[data.playerId] = data.ready;
  for(let player in readyPlayers){
    if(!player) return false
  }
  return true
}

function testWin() {
  Object.keys(playerScores).forEach(key => {
    console.log("Scores:" )
    console.log(playerScores)
    console.log("Players:" )
    console.log(players)

    console.log(playerScores)

    let allFinished = true;
    for(let id in playerScores) {
      if (playerScores[id] <= 0) allFinished = false;
    }

    if (allFinished) {
      let won = true;
      for (let other in playerScores) {
        if (other !== playerId && playerScores[other] > playerScores[playerId]) {
          won = false;
        }
      }


      if (won) {
        // I have won.
        document.getElementById('you_win').style.display = 'block'
        document.getElementById('you_lose').style.display = 'none'

      } else {
        // Someone else has won.
        document.getElementById('you_lose').style.display = 'block'
        document.getElementById('you_win').style.display = 'none'
      }

        // I am the master player and must report the results
      if (playerId === '0') {
        setTimeout(() => sendWinSignal(playerScores), 3000)
      }
    }
  })
}


function sendWinSignal(playerScores) {
  let ranking = Object.keys(playerScores).sort((a, b) => {
    return playerScores[a] - playerScores[b];
  })

  //ranking = Object.keys(playerScores)
  console.log(Object.keys(playerScores).sort((a, b) => {
    return playerScores[a] - playerScores[b];
  }))

  let points = Array.from(ranking);
  for(let i = 0; i<ranking.length; i++){
    points[i] = playerScores[ranking[i]];
  }

  let winReturn = {ranking, points};

  console.log("WIN RETURN:")
  console.log(winReturn)

  if (!gameEnded) {
    parent.postMessage({
      source: 'minigame',
      event: 'win',
      playerScores: winReturn,
    }, '*')

    gameEnded = true
  }
}
