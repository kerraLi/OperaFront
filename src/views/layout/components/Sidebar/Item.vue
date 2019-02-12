<script>
  export default {
    name: 'MenuItem',
    functional: true,
    props: {
      icon: {
        type: String,
        default: ''
      },
      title: {
        type: String,
        default: ''
      },
      message: {
        type: Number,
        default: 0
      }
    },
    render(h, context) {
      const { icon, title, message } = context.props;
      const vnodes = [];

      if (icon) {
        vnodes.push(h('svg-icon', { attrs: { 'icon-class': icon } }, ''));
      }

      if (title) {
        vnodes.push(h('span', { domProps: { slot: 'title' } }, title));
        // 消息中心增加小红点
        if (icon === 'message' && message) {
          let num = message;
          if (num > 99) {
            num = '99+';
          }
          vnodes.push(h('el-badge', { attrs: { value: num } }));
        }
      }
      return vnodes
    }
  }
</script>
