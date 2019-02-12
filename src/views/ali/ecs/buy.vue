<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}"
              v-for="item in buyExample"
              style="margin-bottom:30px;">
        <el-card class="box-card">
          <span>{{ item.name }}</span>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  const buyExample = [{
    'name': 'name1',
    'title': '',
  }, {
    'name': 'name2'
  }, {
    'name': 'name3'
  }, {
    'name': 'name4'
  }, {
    'name': 'name5'
  }];
  export default {
    name: "EcsBuy",
    data() {
      return {
        buyExample
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .box-card {

  }
</style>
