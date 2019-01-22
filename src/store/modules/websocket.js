import Vue from 'vue'
import router from '@/router'


// import { Message, Notification } from 'element-ui'

function error() {//连接建立失败重连
  console.log("errorerrorerror")
  //this.initWebSocket();
}

function message(e) { //数据接收
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
  const data = JSON.parse(e.data);
  // 去除html标签
  const message = data.message.replace(/<[^>]+>/g, "");
  let mHtml = '';
  if (data.imageUrl !== undefined) {
    mHtml = "<div style='cursor: pointer;'>" +
      "<p style='float: left'>" + message + "</p>" +
      "<img style='width: 100%' src='" + data.imageUrl + "'/>" +
      "</div>";
  } else {
    mHtml = "<div style='cursor: pointer;'>" +
      "<p style='float: left'>" + message + "</p>" +
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
}

function open(e) {
  console.log('链接成功', e);
}

//关闭
function close(e) {
  console.log('断开连接', e);
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
    wsConnect: undefined,
  },

  mutations: {
    SET_WS: (state, wsConnect) => {
      state.wsConnect = wsConnect;
      state.wsConnect.onmessage = message;
      state.wsConnect.onopen = open;
      state.wsConnect.onerror = error;
      state.wsConnect.onclose = close;
    },
    SEND_WS: (state, data) => {
      state.wsConnect.send(data)
    }
  },

  actions: {
    initWebSocket({ commit }, userId) {
      return new Promise((resolve) => {
        //初始化weosocket
        const wsUrl = process.env.WEBSOCKET_URL + '/' + userId;
        const ws = new WebSocket(wsUrl);
        commit('SET_WS', ws);
        resolve()
      })
    },
    send({ commit }, data) {
      commit('SEND_WS', data);
    }
  }
};

export default websocket
