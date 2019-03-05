import Vue from 'vue'
import router from '@/router'
import store from '../../store'
import { MessageBox } from "element-ui";


function message(data) {
  // 全局消息处理
  let playPromise = messageMusic.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
    }).catch((error) => {
      Vue.prototype.$message({
        message: '音乐提示播放失败，请打开自动播放声音。chrome://flags/#autoplay-policy',
        type: 'error'
      })
    });
  }

  // 去除html标签
  const message = data.message.replace(/<[^>]+>/g, "");
  let mHtml = '';
  if (data.imageUrl === undefined || data.imageUrl === 'null') {
    mHtml = "<div style='cursor: pointer;'>" +
      "<p style='float: left'>" + message + "</p>" +
      "</div>";
  } else {
    mHtml = "<div style='cursor: pointer;'>" +
      "<p style='float: left'>" + message + "</p>" +
      "<img style='width: 100%' src='" + data.imageUrl + "'/>" +
      "</div>";
  }
  // Notification =》 this.$notify
  dialogArr.push(Vue.prototype.$notify({
    title: data.title,
    position: 'bottom-right',
    duration: 0,
    // 点击事件
    dangerouslyUseHTMLString: true,
    message: mHtml,
    // * 对比redirectMessage(data.id, data.themeId)
    onClick: redirectMessage.bind(this, data.id, data.themeId)
  }));
  // 增加消息数量
  store.dispatch('AddMessageNum', 1);
}

function redirectMessage(id, themeId) {
  for (let i = 0; i < dialogArr.length; i++) {
    dialogArr[i].close();
  }
  // params 注意大小写正确
  Vue.prototype.$nextTick(() => {
    router.push({
      path: '/redirect/message',
      name: 'Message',
      params: {
        openId: id,
        themeId: themeId
      }
    })
  })
}

const dialogArr = [];
const messageMusic = new Audio("../../static/audio/message.mp3");

const websocket = {
  state: {
    wsMsg: '',
    wsConnect: undefined,
    wsCount: 0,
  },
  watch: {
    wsConnect: {}
  },
  mutations: {
    SET_WS_MSG(state, msg) {
      state.wsMsg = msg;
    },
    SET_WS: (state, wsConnect) => {
      state.wsConnect = wsConnect;
    },
    SEND_WS: (state, data) => {
      state.wsConnect.send(data)
    },
    CLOSE_WS: (state) => {
      if (state.wsConnect) {
        state.wsConnect.close();
      }
      state.wsConnect = null;
    },
    ADD_WS_COUNT: (state) => {
      state.wsCount = state.wsCount + 1;
    },
    SET_WS_COUNT: (state, count) => {
      state.wsCount = count;
    }
  },

  actions: {
    initWebSocket({ commit, dispatch }, userId) {
      // 重连次数限制
      if (this.state.websocket.wsCount >= 10) {
        MessageBox.confirm('您的消息连接中心已断开(Websocket)，且重连已超过10次；请确认网络及服务器是否正常。',
          '确认', {
            confirmButtonText: '刷新',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
          location.reload()
        });
        return new Promise((resolve) => {
          resolve()
        });
      }
      return new Promise((resolve) => {
        //初始化weosocket
        const wsUrl = process.env.WEBSOCKET_URL + '/' + userId;
        const ws = new WebSocket(wsUrl);
        ws.onmessage = function (e) {
          const data = JSON.parse(e.data);
          if (data.action === 'speed-test'
            || data.action === 'speed-monitor'
          ) {
            commit('SET_WS_MSG', data);
          } else if (data.action === 'message') {
            message(data)
          }
        };
        // open
        ws.onopen = function open(e) {
          ws.send(JSON.stringify({ 'action': 'message' }));
          let socket = e.target;
          // 连接失败重连
          if (socket.readyState !== 0) {
            commit('SET_WS_COUNT', 0)
          }
        };
        // close
        ws.onclose = function close(e) {
          console.log(self, '断开连接', e);
          // 1000代码：主动断开连接
          if (e.code !== 1000) {
            setTimeout(function () {
              commit('ADD_WS_COUNT');
              dispatch('initWebSocket', userId);
            }, 3000);
          }
        };
        commit('SET_WS', ws);
        resolve()
      })
    },
    sendWebSocket({ commit }, data) {
      return new Promise((resolve) => {
        commit('SEND_WS', JSON.stringify(data));
        resolve()
      })
    }
  }
};

export default websocket
