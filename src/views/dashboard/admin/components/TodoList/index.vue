<template>
  <section class="todoapp">
    <!-- header -->
    <header class="header">
      <input class="new-todo" autocomplete="off" placeholder="Message List" @keyup.enter="addTodo">
    </header>
    <!-- main section -->
    <section v-show="todoList.length" class="main">
      <input id="toggle-all" :checked="allChecked" class="toggle-all" type="checkbox"
             @change="toggleAll({ done: !allChecked })">
      <label for="toggle-all"/>
      <ul class="todo-list">
        <todo
          v-for="(todo, index) in filteredTodos"
          :key="index"
          :todo="todo"/>
      </ul>
    </section>
    <!-- footer -->
    <footer v-show="todoList.length" class="footer">
      <span class="todo-count">
        <strong>{{ remaining }}</strong>
        {{ remaining | pluralize('item') }} left
      </span>
      <ul class="filters">
        <li v-for="(val, key) in filters" :key="key">
          <a :class="{ selected: visibility === key }" @click.prevent="visibility = key">{{ key | capitalize }}</a>
        </li>
      </ul>
    </footer>
  </section>
</template>

<script>
  import Todo from './Todo.vue'

  // 切换面板
  const filters = {
    all: todos => todos,
    new: todos => todos.filter(todo => todo.status === 'new'),
    active: todos => todos.filter(todo => todo.status === 'active'),
    finish: todos => todos.filter(todo => todo.status === 'finish')
  }

  export default {
    components: { Todo },
    filters: {
      pluralize: (n, w) => n === 1 ? w : w + 's',
      capitalize: s => s.charAt(0).toUpperCase() + s.slice(1)
    },
    props: {
      todoList: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        visibility: 'all',
        filters,
      }
    },
    computed: {
      allChecked() {
        return this.todoList.every(todo => todo.done)
      },
      filteredTodos() {
        return filters[this.visibility](this.todoList)
      },
      remaining() {
        return this.todoList.filter(todo => !todo.done).length
      }
    },
    methods: {
    }
  }
</script>

<style lang="scss">
  @import './index.scss';
</style>
