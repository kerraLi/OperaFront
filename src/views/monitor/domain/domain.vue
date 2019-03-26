<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
                 @click="handleCreate">{{ $t('table.add') }}
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-upload"
                 :loading="btnLoading === 'upload'"
                 @click="handleSelectFileBefore">
        {{ $t('table.upload') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-delete"
                 :loading="btnLoading === 'allDelete'"
                 @click="handleDeleteAll">
        {{ $t('table.allDelete') }}
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      row-key="id"
      @selection-change="handleChecked"
      style="width: 100%;">
      <el-table-column
        type="selection"
        width="40"/>
      <el-table-column :label="$t('table.id')" prop="id" align="center" width="65" type="index"/>
      <el-table-column :label="$t('table.monitor.domain')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.name')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button size="mini" type="danger"
                     :loading="btnLoading === 'delete-'+ scope.row.id"
                     @click="handleDelete(scope.row)">{{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>


    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="150px"
               style="width: 800px; margin-left:50px;">
        <el-form-item :label="$t('table.monitor.domain')" prop="path">
          <el-input v-model="temp.path" placeholder="http://www.baidu.com"/>
        </el-form-item>
        <el-form-item :label="$t('table.name')" prop="name">
          <el-input v-model="temp.name" placeholder="域名描述，可为空。"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button :loading="loading" type="primary" @click="dialogStatus===saveData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"/>

    <el-dialog :title="$t('table.resource.selectFile')" :visible.sync="uploadVisible" width="40%">
      <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload"/>
      <el-table
        :data="uploadList"
        border
        fit
        highlight-current-row
        row-key="id"
        style="width: 100%; margin-top: 20px;">
        <el-table-column :label="$t('table.id')" prop="id" align="center" width="65" type="index"/>
        <el-table-column :label="$t('table.monitor.domain')" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row['域名'] }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.name')" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row['名称'] }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div
        slot="footer"
        class="dialog-footer">
        <el-button @click="uploadVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button
          :loading="uploadLoading"
          type="primary"
          @click="handleUpload()">
          {{ $t('table.upload') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { fetchDomainList, uploadDomain, saveDomain, deleteDomain, deleteAllDomain } from '@/api/monitor'
  import waves from '@/directive/waves' // Waves directive
  import Pagination from '@/components/Pagination'
  import Icons from "@/views/svg-icons/index"; // Secondary package based on el-pagination
  import MarkdownViewer from '@/components/MarkdownViewer'
  import UploadExcelComponent from '@/components/UploadExcel/index.vue'

  const tableHeader = ['域名', '名称'];
  const tableHeaderColumn = [
    {
      old: '域名',
      new: 'path'
    }, {
      old: '名称',
      new: 'name'
    }
  ];

  export default {
    name: "MonitorDomain",
    components: { Icons, Pagination, MarkdownViewer, UploadExcelComponent },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          normal: 'success',
          invalid: 'danger'
        };
        return statusMap[status]
      },
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        loading: false,
        btnLoading: '',
        listQuery: {
          page: 1,
          limit: 20,
          key: undefined,
        },
        // 新增&编辑 对象
        temp: {
          id: undefined,
          address: '',
          operator: '',
          path: '',
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: this.$t('table.update'),
          create: this.$t('table.create'),
        },
        // 校验规则
        rules: {
          path: [{ required: true, message: 'path is required', trigger: 'change' }],
        },
        // 多选标记
        checkList: [],
        // upload
        uploadList: [],
        uploadVisible: false,
        uploadLoading: false
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true;
        fetchDomainList().then(response => {
          this.list = response.data.items;
          this.total = response.data.total;
          // Just to simulate the time of the request
          this.listLoading = false
        })
      },
      // 切换标记
      handleChecked(val) {
        this.checkList = val;
      },
      handleFilter() {
        this.getList()
      },
      resetTemp() {
        this.temp = {
          id: undefined,
          address: '',
          operator: '',
          path: '',
        }
      },
      // 新建窗口
      handleCreate() {
        this.resetTemp();
        this.dialogStatus = 'create';
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      // 编辑窗口
      handleUpdate(row) {
        this.temp = Object.assign({}, row);
        this.dialogStatus = 'update';
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      // 编辑账号
      saveData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading = true;
            const tempData = Object.assign({}, this.temp);
            saveDomain(tempData).then(() => {
              this.loading = false;
              this.getList();
              this.dialogFormVisible = false;
              this.$notify({
                title: this.$t('message.success'),
                message: this.$t('message.operSuccess'),
                type: 'success',
                duration: 2000
              })
            }).catch(() => {
              this.loading = false
            })
          }
        })
      },
      // 删除账号
      handleDelete(row) {
        this.btnLoading = 'delete-' + row.id;
        deleteDomain(row.id).then(() => {
          const index = this.list.indexOf(row);
          this.list.splice(index, 1);
          this.$notify({
            title: this.$t('message.success'),
            message: this.$t('message.operSuccess'),
            type: 'success',
            duration: 2000
          })
          this.btnLoading = ''
        })
      },
      // 批量删除
      handleDeleteAll() {
        if (this.checkList.length <= 0) {
          return;
        }
        this.listLoading = true;
        const ids = this.checkList.map((c) => {
          return c.id;
        });
        this.btnLoading = 'allDelete';
        deleteAllDomain(ids).then(response => {
          this.btnLoading = '';
          this.$message({
            message: this.$t('message.operSuccess'),
            type: 'success'
          });
          this.getList()
        }).catch(() => {
          this.btnLoading = '';
        })
      },
      // upload-选择文件窗口
      handleSelectFileBefore() {
        this.uploadList = [];
        this.uploadVisible = true;
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
            if (tableHeader.indexOf(key) >= 0) {
              param[key] = obj[key];
            }
          }
          return param
        });
        this.uploadList = results;
      },
      // upload-确认上传
      handleUpload() {
        if (this.uploadList.length === 0) {
          this.$message({
            message: this.$t('message.hardware.dataEmpty'),
            type: 'warning'
          });
          return false
        }
        let data = this.handleDataUpload();
        // 上传数据库
        this.uploadLoading = true;
        uploadDomain(data).then(response => {
          this.$message({
            message: this.$t('message.operSuccess'),
            type: 'success'
          });
          this.uploadLoading = false;
          this.uploadVisible = false;
          this.getList();
        }).catch(() => {
          this.uploadLoading = false;
        })
      },
      handleDataUpload() {
        let tmp = [];
        this.uploadList.forEach((data) => {
          let tmpData = {};
          tableHeaderColumn.forEach((value) => {
            tmpData[value['new']] = data[value['old']]
          });
          tmp.push(tmpData);
        });
        console.log(tmp);
        return tmp;
      }
    }
  }
</script>

<style scoped>

</style>
