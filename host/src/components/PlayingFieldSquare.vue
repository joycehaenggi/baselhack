<template>
  <div
    class="playing-field-square"
    :style="offsetStyle"
  >
    <img
      class="dino"
      v-for="(dino, index) in dinos"
      :key="index"
      :src="'/dinos/' + dino + '.png'"
      :style="dinoTilt(index)"
    >
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PlayingFieldSquare',
  props: {
    field: Object,
    index: Number
  },
  data () {
    return {
      location: [0, 0],
      borderColors: ['#A34550', '#9C202E', '#CB605E', '#9C202E', '#CB605E', '#E29063', '#B95D23', '#924419', '#E29063', '#B95D23', '#D3D736', '#C5CF4F', '#D7E3AC', '#C5CF4F', '#F0F36F', '#D9D91F', '#D0D069', '#D9D91F', '#E4E474', '#8DB355', '#A5DFC2', '#92D16C', '#A4CE65', '#B2CED1', '#A4CE65', '#92D16C', '#7AE399', '#47B6C3', '#5AF9BD', '#0ED3DF', '#5AF9BD', '#B7C5CA', '#0ED3DF', '#5AF9BD', '#B7C5CA', '#0C1217', '#28269F', '#508FED', '#2F5FAA', '#28269F', '#2D4C80', '#28269F', '#2F5FAA', '#508FED', '#0C1217', '#2F5FAA', '#508FED', '#2F5FAA', '#7CABD0', '#F4D0D0']
    }
  },
  created () {
    const row = Math.floor(this.index / 10)
    const col = (row % 2 === 0) ? this.index % 10 : 9 - this.index % 10
    this.location = [row, col]
  },
  computed: {
    ...mapState([ 'session' ]),
    dinos () {
      return this.session.players.filter(p => p.position === this.index).map(player => player.dino)
    },
    offsetStyle () {
      const OFFSET_X = 7
      const OFFSET_Y = 6.3
      const INTERVAL_X = 8.58
      const INTERVAL_Y = 13.35

      return {
        bottom: OFFSET_Y + (this.location[0] * INTERVAL_Y) + '%',
        left: OFFSET_X + (this.location[1] * INTERVAL_X) + '%',
        'box-shadow': this.field.type === 'miniGame' ? 'inset 0 0 30px ' + this.borderColors[this.index] : ''
      }
    }
  },
  methods: {
    dinoTilt () {
      let styleClass = `transform: rotate(${Math.random() * 20 - 10}deg)`
      if (this.location[0] % 2 !== 0) styleClass += ` scaleX(-1);`

      return styleClass
    }
  }
}
</script>

<style lang="scss" scoped>
.playing-field-square {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8.58%;
  height: 13.35%;
  background: rgba(0,0,0,.5);

  .dino {
    position: absolute;
    height: 70%;
  }
}
</style>
