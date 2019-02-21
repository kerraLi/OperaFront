<template>
  <div class="app-container">
    <div class="filter-container" style="margin-top:20px;">
      <el-select
        class="filter-item"
        v-model="cateTreeSelection"
        :placeholder="$t('table.resource.selectCate')">
        <el-option value="-1" style="display: none;"/>
        <!--el-tree绑定的数组中children里的key值不能是-1-->
        <el-tree
          ref="tree"
          :data="cateTreeOptions"
          :props="cateTreeProps"
          node-key="id"
          show-checkbox
          default-expand-all
          highlight-current
          check-strictly
          @check="handleCateTreeSelect"/>
      </el-select>
      <el-button-group class="filter-item" style="margin-left: 10px;">
        <el-button type="primary" icon="el-icon-search"
                   :loading="btnLoading === 'upload'"
                   @click="handleSelectFileBefore">
          {{ $t('table.resource.selectFile') }}
        </el-button>
        <el-button type="primary" icon="el-icon-upload"
                   :loading="btnLoading === 'upload'"
                   @click="handleUpload">
          {{ $t('table.upload') }}
        </el-button>
      </el-button-group>
      <el-button class="filter-item" type="primary" icon="el-icon-delete" style="margin-left: 10px;"
                 @click="handleClear">
        {{ $t('table.clear') }}
      </el-button>
    </div>

    <el-table :data="tableData" border highlight-current-row style="width: 100%;">
      <el-table-column v-if="tableHeader.length>0" :label="$t('table.id')" prop="id" align="center" width="65"
                       type="index"/>
      <el-table-column v-for="item of tableHeader" :prop="item" :label="item" :key="item"/>
    </el-table>

    <el-dialog :title="$t('table.resource.selectFile')" :visible.sync="dialogFormVisible" width="40%">
      <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload"/>
    </el-dialog>
  </div>
</template>

<script>
  import { fetchTypeList, fetchCateList, uploadData } from '@/api/resource'
  import UploadExcelComponent from '@/components/UploadExcel/index.vue'

  const typeTrees = [
    {
      code: 'menu',
      name: '目录',
      column: '[]'
    }
  ];

  export default {
    name: "HardwareUpload",
    components: { UploadExcelComponent },
    data() {
      return {
        loading: false,
        btnLoading: '',
        // cate tree
        cateTreeProps: {
          children: 'children',
          label: 'pathName',
        },
        cateTreeTypes: typeTrees,
        cateTreeOptions: null,
        cateTreeSelection: null,
        cateTreePathName: '',
        cateTreeTypeCode: '',
        cateTreeTypeName: '',
        // dialog
        dialogFormVisible: false,
        // table
        tableData: [],
        tableHeader: [],
      }
    },
    watch: {
      cateTreePathName: function (value) {
        this.$nextTick(() => {
          this.cateTreeSelection = value + '  [' + this.cateTreeTypeName + ']';
        });
      }
    },
    created() {
      this.getCateTreeType();
    },
    methods: {
      // category type
      getCateTreeType() {
        fetchTypeList().then(response => {
          this.cateTreeTypes = this.cateTreeTypes.concat(response.data);
          this.getCateTreeOptions();
        })
      },
      // category
      getCateTreeOptions() {
        this.cateTreeOptions = [];
        fetchCateList().then(response => {
          let tempList = response.data;
          // 按照id正序排序
          tempList.sort((a, b) => {
            return a.id - b.id;
          });
          // 数据排序格式化（按id排序后）
          tempList.forEach((v) => {
            v.component = () => import('@/views/resource/hardware');
            v.name = v.pathName;
            v.meta = {
              title: v.pathName
            };
          });
          // 数据树形格式化(按照父子关系)
          tempList.forEach((v) => {
            v.children = [];
            v.disabled = false;
            if (v.parentId === 0) {
              this.cateTreeOptions.push(v);
            } else {
              let parent = tempList.find((c) => {
                return c.id === v.parentId;
              });
              parent.children.push(v);
              parent.disabled = true;
            }
          });
        });
      },
      // category-select
      handleCateTreeSelect(data, checked) {
        if (checked) {
          this.$refs.tree.setCheckedKeys([]);
          this.$refs.tree.setCheckedKeys([data.id]);
          this.cateTreePathName = data.pathName;
          let tmp = this.cateTreeTypes.filter((c) => {
            return c.code === data.type
          });
          this.cateTreeTypeCode = data.type;
          this.cateTreeTypeName = tmp.length > 0 ? tmp[0].name : data.type;
          this.tableHeader = tmp.length > 0 ? JSON.parse(tmp[0].column) : [];
        } else {
          let checks = this.$refs.tree.getCheckedKeys();
          if (checks.length === 0) {
            this.cateTreePathName = '';
            this.cateTreeTypeCode = '';
            this.cateTreeTypeName = '';
            this.tableHeader = [];
          }
        }
      },
      // upload-选择文件窗口
      handleSelectFileBefore() {
        if (this.tableHeader.length === 0) {
          this.$message({
            message: this.$t('message.resource.needCategory'),
            type: 'warning'
          });
          return false;
        }
        this.dialogFormVisible = true;
      },
      // upload-文件上传前校验
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
      // upload-文件上传成功后
      handleSuccess({ results, header }) {
        // 过滤字段
        results = results.map((obj) => {
          let param = {};
          for (let key in obj) {
            if (this.tableHeader.indexOf(key) >= 0) {
              param[key] = obj[key];
            }
          }
          return param
        });
        this.dialogFormVisible = false;
        this.tableData = results;
      },
      // upload-清空
      handleClear() {
        this.tableData = [];
      },
      // upload-确认上传
      handleUpload() {
        if (this.tableData.length === 0) {
          this.$message({
            message: this.$t('message.hardware.dataEmpty'),
            type: 'warning'
          });
          return false
        }
        // 上传数据库
        let data = this.handleDataUpload();
        let cateId = this.$refs.tree.getCheckedKeys()[0];

        this.btnLoading = 'upload';
        uploadData(cateId, data).then(response => {
          this.$message({
            message: this.$t('message.operSuccess'),
            type: 'success'
          });
          this.btnLoading = '';
        }).catch(() => {
          this.btnLoading = '';
        })
      },
      handleDataUpload() {
        let tmp = [];
        this.tableData.forEach((data) => {
          let tmpData = [];
          this.tableHeader.forEach((value) => {
            tmpData.push(data[value] ? data[value] : '');
          });
          tmp.push(tmpData);
        });
        return tmp;
      }
    }
  }
</script>

<style scoped>

</style>
