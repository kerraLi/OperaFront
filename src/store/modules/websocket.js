import Vue from 'vue'
import router from '@/router'
import store from '../../store'


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
      state.wsConnect.close();
      state.wsConnect = null;
    }
  },

  actions: {
    initWebSocket({ commit }, userId) {
      return new Promise((resolve) => {
        //初始化weosocket
        const wsUrl = process.env.WEBSOCKET_URL + '/' + userId;
        const ws = new WebSocket(wsUrl);
        ws.onmessage = function (e) {
          const data = JSON.parse(e.data);
          if (data.action === 'speed-test') {
            commit('SET_WS_MSG', data);
          } else if (data.action === 'message') {
            message(data)
          }
        };
        // open
        ws.onopen = function open(e) {
          ws.send(JSON.stringify({ 'action': 'message' }));
          let socket = e.target;
          let timer = null;
          if (socket.readyState === 0) {
            // 如果延时器不等于null就先清除定时器
            if (timer) {
              clearTimeout(timer)
            }
            timer = setTimeout(function () {
              console.log('尝试重新连接', e);
              this.initWebSocket(userId);
              timer = null
            }, 500)
          }
        };
        // error
        ws.onerror = function error() {
          self.initWebSocket(userId);
        };
        // close
        ws.onclose = function close(e) {
          // 1000代码：主动断开连接
          if (e.code !== 1000) {
            self.initWebSocket(userId);
          }
          console.log('断开连接', e);
        };
        commit('SET_WS', ws);
        resolve()
      })
    },
    sendWebSocket({ commit }, data) {
      commit('SEND_WS', JSON.stringify(data), function (bbb) {
        console.log(bbb)
      });
    }
  }
};

export default websocket
