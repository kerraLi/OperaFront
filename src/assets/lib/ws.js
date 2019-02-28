import utils from './utils'
import { Loading } from 'element-ui'

function DataViewExt(buffer) {
  let dv = new DataView(buffer, 0)
  dv.setString = function (offset, string) {
    for (let i = 0; i < string.length; i++) {
      let c = string.charCodeAt(i)
      this.setUint8(offset + i, c)
    }
  }
  dv.setBinary = function (offset, binary) {
    for (let i = 0; i < binary.length; i++) {
      this.setUint8(offset + i, binary[i])
    }
  }
  return dv
}

export default {
  loadingInstance: '', // Lading加载
  loadingOptions: { // Loading选项
    lock: true,
    text: '连接断开，正在重连',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.8)'
  },
  num: 0, // 重新连接次数
  // 创建Socket实例
  init(url, form, callback) {
    let self = this
    if (!url) return false
    let api = 'ws://' + url + '?u=' + encodeURIComponent(form.username) + '&p=' + encodeURIComponent(form.password)
    const Socket = new WebSocket(api)
    // 连接建立时触发
    Socket.onopen = function () {
      // 验证webscoket连接是否建立，是否可以进行通信
      // 0表示连接尚未建立
      let reconnectTimer = null
      if (Socket.readyState === 0) {
        // 如果延时器不等于null就先清除定时器
        if (reconnectTimer) {
          clearTimeout(reconnectTimer)
        }
        reconnectTimer = setTimeout(function () {
          self.init(url, form, callback)
          reconnectTimer = null
        }, 500)
      }
      // 1表示连接已建立，可以进行通信
      if (Socket.readyState === 1) {
        if (self.loadingInstance) {
          self.loadingInstance.close()
        }
        // 如果已建立连接直接返回当前实例,保存到vue状态中
        callback(Socket)
      }
    }
    // 接收消息时触发
    Socket.onmessage = function (response) {
      // 拦截服务器推送的string类型数据
      if (typeof response.data === 'string') {
        utils.readString(response.data, (res) => {
        })
      }
    }
    // socket关闭时触发
    Socket.onclose = function () {
      self.reconnect(url, form, callback)
    }
  },
  // 请求设备数据
  sendKey(Socket, url, key) {
    let self = this
    if (url) {
      // 验证webscoket连接是否建立，是否可以进行通信
      if (Socket.readyState) {
        // 0表示连接尚未建立
        if (Socket.readyState === 0) {
          setTimeout(function () {
            self.sendKey(Socket, url, key)
          }, 300)
        }
        // 1表示连接已建立，可以进行通信
        if (Socket.readyState === 1) {
          Socket.send(url + '\n' + key)
        }
      }
    }
  },
  // 发送设备数据
  sendData(Socket, url, data) {
    let self = this
    if (url) {
      // 验证webscoket连接是否建立，是否可以进行通信
      if (Socket.readyState) {
        // 0表示连接尚未建立
        if (Socket.readyState === 0) {
          setTimeout(function () {
            self.sendData(Socket, url, data)
          }, 300)
        }
        // 1表示连接已建立，可以进行通信
        if (Socket.readyState === 1) {
          let buffer = new ArrayBuffer(url.length + 1 + data.length)
          let dv = new DataViewExt(buffer)
          dv.setString(0, url)
          dv.setUint8(url.length, 10)
          dv.setBinary(url.length + 1, data)
          Socket.send(buffer)
        }
      }
    }
  },
  // 请求宏配置列表
  sendMacro(Socket, url, obj) {
    let self = this
    if (url) {
      // 验证webscoket连接是否建立，是否可以进行通信
      if (Socket.readyState) {
        // 0表示连接尚未建立
        if (Socket.readyState === 0) {
          setTimeout(function () {
            self.sendMacro(Socket, url, obj)
          }, 300)
        }
        // 1表示连接已建立，可以进行通信
        if (Socket.readyState === 1) {
          if (obj) {
            Socket.send(url + '\n' + JSON.stringify(obj))
          } else {
            Socket.send(url)
          }
        }
      }
    }
  },
  // 重新连接
  reconnect(url, form, callback) {
    let windowUrl = window.location.href
    let path = windowUrl.slice(windowUrl.indexOf('#') + 1, windowUrl.length)
    if (this.num > 20) {
      window.location.href = 'http://localhost:8080'
    }
    this.num++
    if (path === '/') {
      return false
    }
    this.loadingInstance = Loading.service(this.loadingOptions)
    this.init(url, form, callback)
  }
}
