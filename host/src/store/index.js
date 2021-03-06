import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    session: null
  },
  mutations: {
    setSession (state, item) {
      state.session = item
    }
  },
  actions: {
  },
  modules: {
  }
})
