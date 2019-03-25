import { getNewNumber } from '@/api/message'

const message = {
  state: {
    number: undefined
  },
  mutations: {
    SET_NUM: (state, num) => {
      state.number = num;
    },
    SUB_NUM: (state, num) => {
      state.number = state.number - num;
    },
    ADD_NUM: (state, num) => {
      state.number = state.number + num;
    }
  },
  actions: {
    // 获取newMessage数量
    GetMessageNum({ commit }) {
      return new Promise((resolve, reject) => {
        getNewNumber().then(response => {
          let res = response.data;
          commit('SET_NUM', res.result);
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 减少newMessage数量
    SubMessageNum({ commit }, number) {
      return new Promise((resolve) => {
        commit('SUB_NUM', number);
        resolve()
      });
    },
    // 增加newMessage数量
    AddMessageNum({ commit }, number) {
      return new Promise((resolve) => {
        commit('ADD_NUM', number);
        resolve()
      });
    }
  }
};

export default message;
