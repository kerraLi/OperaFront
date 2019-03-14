<template>
  <div :id="id"/>
</template>

<script>
  // deps for editor
  import 'codemirror/lib/codemirror.css' // codemirror
  import 'tui-editor/dist/tui-editor.css' // editor ui
  import 'tui-editor/dist/tui-editor-contents.css' // editor content

  const Viewer = require('tui-editor/dist/tui-editor-Viewer');


  export default {
    name: 'MarkdownContent',
    props: {
      id: {
        type: String,
        required: false,
        default() {
          return 'markdown-content-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')
        }
      },
      value: {
        type: String,
        default: ''
      },
      height: {
        type: String,
        required: false,
        default: '300px'
      },
    },
    data() {
      return {
        viewer: null
      }
    },
    mounted() {
      this.init()
    },
    destroyed() {
      this.destroy()
    },
    methods: {
      init() {
        this.viewer = new Viewer({
          el: document.getElementById(this.id),
          height: this.height
        });
        if (this.value) {
          this.viewer.setValue(this.value)
        }
      },
      destroy() {
        if (!this.editor) return;
        this.editor.remove()
      }
    }
  }
</script>
