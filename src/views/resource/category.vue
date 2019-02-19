<template>
  <div class="app-container">
    <el-tabs v-model="tabActiveName" @tab-click="handleTabs">
      <!--category-->
      <el-tab-pane class="refresh-tab" :label="$t('table.resource.resourceCate')" name="category">
        <category/>
      </el-tab-pane>
      <!--type-->
      <el-tab-pane :label="$t('table.resource.resourceType')" name="type">
        <type/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import Category from './components/Category'
  import Type from './components/Type'


  export default {
    name: "ResourceCate",
    components: {
      Category,
      Type
    },
    data() {
      return {
        tabActiveName: 'category',
      }
    },
    methods: {
      // 切换tab
      handleTabs(tab) {
      },
    }
  }
</script>

<style scoped>

</style>
