<template>
  <li :class="{ completed: todo.status ==='finish' , editing: editing }" class="todo">
    <div class="view">
      <input
        :checked=" todo.status ==='finish'"
        class="toggle"
        type="checkbox">
      <label @click="jumpToMessage( todo )" style="cursor: pointer;">
        <el-tag class="small" type="success" v-if="todo.status === 'new'">{{ todo.status }}</el-tag>
        <el-tag class="small" type="warning" v-if="todo.status === 'active'">{{ todo.status }}</el-tag>
        {{ todo.themeId }}
      </label>
    </div>
  </li>
</template>

<script>
  export default {
    name: 'Todo',
    directives: {
      focus(el, { value }, { context }) {
        if (value) {
          context.$nextTick(() => {
            el.focus()
          })
        }
      }
    },
    props: {
      todo: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    data() {
      return {
        editing: false
      }
    },
    methods: {
      jumpToMessage(todo) {
        // params 注意大小写正确
        this.$nextTick(() => {
          this.$router.push({
            path: '/redirect/message',
            name: 'Message',
            params: {
              openId: todo.id,
              themeId: todo.themeId
            }
          })
        })
      }
    }
  }
</script>
