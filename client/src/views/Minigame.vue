<template>
  <iframe
    id="minigame_frame"
    ref="iframe"
    :src="iframeUrl"
  ></iframe>
</template>

<script>
export default {
  name: 'minigame',
  props: {
    game: Object
  },
  computed: {
    iframeUrl () {
      return this.game.url + '?playerId=' + this.$store.state.playerId + '&players=' + JSON.stringify(this.$store.state.session.players)
    }
  },
  created () {
    window.addEventListener('message', this.onMessage, false)
  },
  beforeDestroy () {
    window.removeEventListener('message', this.onMessage)
  },
  sockets: {
    MINIGAME (msg) {
      this.$refs.iframe.contentWindow.postMessage(msg, '*')
    }
  },
  methods: {
    onMessage (msg) {
      if (msg.data.source === 'minigame') {
        if (msg.data.event === 'win') {
          this.$socket.emit('endMiniGame', {
            sessionId: this.$store.state.session.id,
            playerScores: msg.data.playerScores
          })
        } else {
          this.$socket.emit('MINIGAME', {
            sessionId: this.$store.state.session.id,
            msg: msg.data
          })
        }
      }
    }
  }
}
</script>

<style scoped>
#minigame_frame {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}
</style>
