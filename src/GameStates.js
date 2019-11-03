import * as _ from 'lodash'
import { DINO_TYPES, MAX_PLAYERS, BOARD_SIZE, SPECIAL_TYPES } from './GameSession'

export class StateWaitingForPlayers {
  constructor (session) {
    this.name = this.constructor.name
    this.session = session

    this.dinos = _.shuffle(DINO_TYPES)
  }

  addPlayer (name) {
    if (this.session.players.length < MAX_PLAYERS) {
      const existingPlayer = _.find(this.session.players, player => player.name === name)
      if (!existingPlayer) {
        return this.session.players.push({
          name,
          score: 0,
          position: Math.floor(BOARD_SIZE / 2),
          dino: this.dinos.pop()
        })
      } else {
        throw 'NameAlreadyTaken'
      }
    } else {
      throw 'MaxPlayerCountExceeded'
    }
  }

  playersReady () {
    if (this.session.players.length >= 3) {
      this.session.state = new StateRulesMain(this.session)
    } else {
      throw 'NotEnoughPlayers'
    }
  }
}

export class StateRulesMain {
  constructor (session) {
    this.name = this.constructor.name
    this.session = session
  }

  startGame () {
    this.session.state = new StatePlayerTurn(this.session)
    this.session.playerTurn = 0
  }

}
export class StatePlayerTurn {
  constructor (session, increment) {
    this.name = this.constructor.name
    this.session = session

    if (increment) this.incrementPlayerTurn()
  }

  incrementPlayerTurn () {
    this.session.playerTurn++
    if (this.session.playerTurn > this.session.players.length - 1) this.session.playerTurn = 0
  }

  startMove (diceResult) {
    this.session.state = new StateMove(this.session, diceResult)
  }
}
export class StateMove {
  constructor (session, numSteps) {
    this.name = this.constructor.name
    this.session = session
    this.numSteps = numSteps
  }

  moveSteps (numSteps) {
    const playerTurn = this.session.playerTurn
    this.session.players[playerTurn].position += numSteps

    if (this.session.players[playerTurn].position < 0) { // Field before the start
      this.session.players[playerTurn].position = 0
    } else if (this.session.players[playerTurn].position >= BOARD_SIZE - 1) { // Win condition
      this.win()
    }

    const targetField = this.session.board[this.session.players[playerTurn].position]

    switch (targetField.type) {
      case 'basic':
        this.session.state = new StatePlayerTurn(this.session, true)
        break
      case 'miniGame':
        this.startMiniGame()
        break
      case 'special':
        this.doSpecialAction(targetField)
        break
    }
  }

  startMiniGame () {
    const miniGame = _.sample(this.session.minigames)
    this.session.state = new StateMiniGame(this.session, miniGame)
  }

  doSpecialAction (field) {
    this.session.state = new StateRulesSpecialField(this.session, field)
  }

  win () {
    this.session.state = new StateWin(this.session)
  }
}
export class StateRulesSpecialField {
  constructor (session, field) {
    this.name = this.constructor.name
    this.session = session
    this.field = field
  }
}
export class StateMoveSpecialField {
  constructor (session) {
    this.name = this.constructor.name
    this.session = session
  }
}
export class StateMiniGame {
  constructor (session, game) {
    this.name = this.constructor.name
    this.session = session
    this.game = game

    this.game.url = `http://localhost:3000/minigame/${this.game.name}/index.html`
  }

  endMinigame (playerScores) {
    Object.keys(playerScores).forEach(key => {
      this.session.players[key].score += playerScores[key]
    })

    this.session.state = new StatePlayerTurn()
  }
}
export class StateMiniGameResult {
  constructor (session, playerScores) {
    this.name = this.constructor.name
    this.session = session
    this.playerScores = playerScores
  }

  moveMiniGame () {
    this.session.state = new StateMoveMiniGame(this.session, this.playerScores)
  }
}
export class StateMoveMiniGame {
  constructor (session, playerScores) {
    this.name = this.constructor.name
    this.session = session
    this.playerScores = playerScores
  }

  moveSteps () {
    const ranking = this.playerScores.ranking
    let playerMoves = new Array(ranking.length).fill(0)

    // How much does each player move
    for (let i = 0; i < ranking.length; i++) {
      playerMoves[ranking[i]] = (ranking.length / 2) - i
    }

    for (let j = 0; j < playerMoves.length; j++) {
      const numSteps = playerMoves[i]
      this.session.players[i].position += numSteps

      if (this.session.players[i].position < 0) { // Field before the start
        this.session.players[i].position = 0
      } else if (this.session.players[i].position >= BOARD_SIZE - 1) { // Win condition
        this.win()
      }
    }

    this.session.state = new StatePlayerTurn(this.session, true)
  }

  win () {
    this.session.state = new StateWin(this.session)
  }
}
export class StateWin {
  constructor (session) {
    this.name = this.constructor.name
    this.session = session
  }

  rematch () {
    this.session.state = new StateRulesMain(this.session)
  }
}
