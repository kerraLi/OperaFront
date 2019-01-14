<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
    <sidebar class="sidebar-container"/>
    <div class="main-container">
      <navbar/>
      <tags-view/>
      <app-main/>
    </div>
  </div>
</template>

<script>
  import { Navbar, Sidebar, AppMain, TagsView } from './components'
  import ResizeMixin from './mixin/ResizeHandler'
  import { mapGetters } from 'vuex'

  export default {
    name: 'Layout',
    components: {
      Navbar,
      Sidebar,
      AppMain,
      TagsView
    },
    mixins: [ResizeMixin],
    computed: {
      // 调用getters中存滴参数
      ...mapGetters([
        'id',
      ]),
      sidebar() {
        return this.$store.state.app.sidebar
      },
      device() {
        return this.$store.state.app.device
      },
      classObj() {
        return {
          hideSidebar: !this.sidebar.opened,
          openSidebar: this.sidebar.opened,
          withoutAnimation: this.sidebar.withoutAnimation,
          mobile: this.device === 'mobile'
        }
      }
    },
    created() {
      console.log("test web")
      this.initWebSocket(this.id)
    },
    methods: {
      handleClickOutside() {
        this.$store.dispatch('closeSideBar', { withoutAnimation: false })
      },
      /**
       * websocket
       */
      initWebSocket(userId) {
        //初始化weosocket
        const wsuri = process.env.WEBSOCKET_URL + '/' + userId;
        this.websock = new WebSocket(wsuri);
        this.websock.onmessage = this.websocketOnmessage;
        this.websock.onopen = this.websocketOnopen;
        this.websock.onerror = this.websocketOnerror;
        this.websock.onclose = this.websocketClose;
      },
      websocketOnopen() { //连接建立之后执行send方法发送数据
        let actions = { "test": "12345" };
        this.websocketSend(JSON.stringify(actions));
      },
      websocketOnerror() {//连接建立失败重连
        this.initWebSocket();
      },
      websocketOnmessage(e) { //数据接收
        const data = JSON.parse(e.data);
        this.$notify({
          title: data.title,
          message: data.title,
          position: 'bottom-right',
          duration: 0,
          // 点击事件
          onClick: ''
        });
      },
      websocketSend(Data) {//数据发送
        this.websock.send(Data);
      },
      websocketClose(e) {  //关闭
        console.log('断开连接', e);
      },
    },
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "~@/styles/mixin.scss";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;

    &.mobile.openSidebar {
      position: fixed;
      top: 0;
    }
  }

  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }
</style>
