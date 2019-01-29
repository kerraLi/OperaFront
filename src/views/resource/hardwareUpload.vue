<template>
  <div class="app-container">
    <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload"/>
    <div class="filter-container" style="margin-top:20px;">
      <el-button class="filter-item" type="primary" icon="el-icon-search"
                 @click="handleClear">
        {{ $t('table.clear') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-upload"
                 :loading="btnLoading === 'upload'"
                 @click="handleUpload">
        {{ $t('table.upload') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-download"
                 :loading="btnLoading === 'download'"
                 @click="handleDownload">
        {{ $t('table.downloadExample') }}
      </el-button>
    </div>
    <el-table :data="tableData" border highlight-current-row style="width: 100%;">
      <!--<el-table-column v-for="item of tableHeader" :prop="item" :label="item" :key="item"/>-->
      <el-table-column :label="$t('table.id')" prop="id" align="center" width="65" type="index"/>
      <el-table-column :label="$t('table.resource.username')">
        <template slot-scope="scope">
          <span>{{ scope.row['帐号'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.password')">
        <template slot-scope="scope">
          <span>{{ scope.row['密码'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.cabinet')">
        <template slot-scope="scope">
          <span>{{ scope.row['机柜'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.model')">
        <template slot-scope="scope">
          <span>{{ scope.row['型号'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.assetNumber')">
        <template slot-scope="scope">
          <span>{{ scope.row['资产编号'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.sn')">
        <template slot-scope="scope">
          <span>{{ scope.row['SN'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.operateSystem')">
        <template slot-scope="scope">
          <span>{{ scope.row['操作系统'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.effect')">
        <template slot-scope="scope">
          <span>{{ scope.row['作用'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.externalIp')">
        <template slot-scope="scope">
          <span>{{ scope.row['专线IP'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.externalMainLine')">
        <template slot-scope="scope">
          <span>{{ scope.row['外网主线'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.externalBackupLine')">
        <template slot-scope="scope">
          <span>{{ scope.row['外网备线'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.intranetIp')">
        <template slot-scope="scope">
          <span>{{ scope.row['内网IP'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.manageCardIp')">
        <template slot-scope="scope">
          <span>{{ scope.row['管理卡IP'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.mask')">
        <template slot-scope="scope">
          <span>{{ scope.row['掩码'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.remotePort')">
        <template slot-scope="scope">
          <span>{{ scope.row['远程端口'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.intranetPort')">
        <template slot-scope="scope">
          <span>{{ scope.row['内网端口'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.managePort')">
        <template slot-scope="scope">
          <span>{{ scope.row['管理端口'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.externalPort')">
        <template slot-scope="scope">
          <span>{{ scope.row['专线端口'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.cpu')">
        <template slot-scope="scope">
          <span>{{ scope.row['CPU'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.memory')">
        <template slot-scope="scope">
          <span>{{ scope.row['内存'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.raid')">
        <template slot-scope="scope">
          <span>{{ scope.row['RAID'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.hardDisk')">
        <template slot-scope="scope">
          <span>{{ scope.row['硬盘'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.power')">
        <template slot-scope="scope">
          <span>{{ scope.row['电源'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.uNumber')">
        <template slot-scope="scope">
          <span>{{ scope.row['U数'] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.remark')">
        <template slot-scope="scope">
          <span>{{ scope.row['备注'] }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import UploadExcelComponent from '@/components/UploadExcel/index.vue'
  import { uploadHardware } from '@/api/resource'

  export default {
    name: "HardwareUpload",
    components: { UploadExcelComponent },
    data() {
      return {
        btnLoading: '',
        tableData: [],
        tableHeader: [],
        // 有效字段
        param: [
          '帐号', '密码', '机柜', '型号', '资产编号', 'SN', '操作系统', '作用', '专线IP', '外网主线', '外网备线', '内网IP', '管理卡IP',
          '掩码', '远程端口', '内网端口', '管理端口', '专线端口', 'CPU', '内存', 'RAID', '硬盘', '电源', 'U数', '备注'
        ]
      }
    },
    methods: {
      // 清空
      handleClear() {
        this.tableData = [];
      },
      // 下载
      handleDownload() {
        this.btnLoading = 'download';
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = this.param;
          const data = [];
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'Hardware Example'
          });
          this.btnLoading = '';
        })
      },
      // 上传
      handleUpload() {
        if (this.tableData.length === 0) {
          this.$message({
            message: this.$t('message.hardware.dataEmpty'),
            type: 'warning'
          });
          return false
        }
        for (let obj in this.tableData) {
          if (this.tableData[obj]['机柜'] === undefined || this.tableData[obj]['机柜'] === '') {
            this.$message({
              message: this.$t('message.hardware.needCabinet'),
              type: 'warning'
            });
            return false
          }
        }
        // 上传数据库
        this.btnLoading = 'upload';
        uploadHardware(this.tableData).then(response => {
          this.$message({
            message: this.$t('message.operSuccess'),
            type: 'success'
          });
          this.btnLoading = '';
        }).catch(() => {
          this.btnLoading = '';
        })
      },
      beforeUpload(file) {
        const isLt1M = file.size / 1024 / 1024 < 1;

        if (isLt1M) {
          return true
        }

        this.$message({
          message: this.$t('message.hardware.fileTooMuch'),
          type: 'warning'
        });
        return false
      },
      handleSuccess({ results, header }) {
        // 过滤字段
        results = results.map((obj) => {
          let param = {};
          for (let key in obj) {
            if (this.param.indexOf(key) >= 0) {
              param[key] = obj[key];
            }
          }
          return param
        });
        this.tableData = results;
        this.tableHeader = header;
      }
    }
  }
</script>

<style scoped>

</style>
