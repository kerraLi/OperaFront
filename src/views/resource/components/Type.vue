<template>
  <div class="type">
    <!-- 添加新的类型 -->
    <!--<div class="filter-container">-->
    <!--<el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"-->
    <!--@click="handleCreate">{{ $t('table.add') }}-->
    <!--</el-button>-->
    <!--</div>-->
    <el-row :gutter="32">
      <el-col v-for="item in list" :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper" style="margin-bottom: 40px;">
          <el-card class="box-card">
            <div slot="header" style="position:relative;">
              <span>{{ item.name }}</span>
              <el-button style="float: right; padding: 3px 0" type="text"
                         :loading="btnLoading === 'download-'+item.id"
                         icon="el-icon-download"
                         @click="handleDownload(item)">下载示例文件
              </el-button>
            </div>
            <div
              style="position: relative;height: 100px;overflow: hidden;font: 12px/1.5 Tahoma,Helvetica,Arial,'宋体',sans-serif;">
              {{ item.column }}
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { fetchTypeList, saveType, removeType } from '@/api/resource'

  export default {
    name: "Type",
    data() {
      return {
        btnLoading: '',
        loading: false,
        listLoading: false,
        list: null,
        temp: {
          id: undefined,
          code: '',
          name: '',
          exampleFile: '',
          column: ''
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true;
        fetchTypeList().then(response => {
          this.list = response.data;
          this.listLoading = false;
        })
      },
      // 下载
      handleDownload(item) {
        this.btnLoading = 'download-' + item.id;
        import('@/vendor/Export2Excel').then(excel => {
          // json 字符串数组
          const tHeader = JSON.parse(item.column);
          const data = [];
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: item.name
          });
          this.btnLoading = '';
        })
      },
    }
  }
</script>

<style scoped>

</style>
