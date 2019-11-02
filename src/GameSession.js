import { makeId } from './utils'
import * as _ from 'lodash'
import * as GameStates from './GameStates'
import Minigame from './Minigame'

const MIN_PLAYERS = 2
const MAX_PLAYERS = 10

export default class GameSession {
  constructor () {
    this.id = makeId(4)

    this.state = new GameStates.StateWaitingForPlayers()

    this.settings = {}
    this.players = []
    this.minigames = Minigame.loadGames()
  }

  addPlayer (name) {
    if (this.state.name === 'StateWaitingForPlayers') {
      if (this.players.length < MAX_PLAYERS) {
        const existingPlayer = _.find(this.players, player => player.name === name)
        if (!existingPlayer) {
          return this.players.push({
            name,
            score: 0
          })
        } else {
          throw 'NameAlreadyTaken'
        }
      } else {
        throw 'MaxPlayerCountExceeded'
      }
    } else {
      throw 'InvalidState'
    }
  }

  startGame () {
    this.startMinigame()
  }

  startMinigame () {
    // the following line selects a random game:
    const minigame = _.sample(this.minigames)

    // for testing -> select a specific game -> work in progress
    // const minigame = this.minigames[this.minigames.length]

    this.state = new GameStates.StateMinigame(minigame)
  }

  endMinigame (playerScores) {
    console.log(playerScores)
    Object.keys(playerScores).forEach(key => {
      this.players[key].score += playerScores[key]
    })

    this.state = new GameStates.StateGameIdle()
  }
}
