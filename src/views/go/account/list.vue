<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
                 @click="handleCreate">{{ $t('table.add') }}
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column :label="$t('table.id')" prop="id" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="UserName" min-width="80px">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="AccessKeyId" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.accessKeyId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="AccessKeySecret" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.accessKeySecret }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">{{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>


    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="150px"
               style="width: 800px; margin-left:50px;">
        <el-form-item label="UserName" prop="userName">
          <el-input v-model="temp.userName"/>
        </el-form-item>
        <el-form-item label="AccessKeyId" prop="accessKeyId">
          <el-input v-model="temp.accessKeyId"/>
        </el-form-item>
        <el-form-item label="AccessKeySecret" prop="accessKeySecret">
          <el-input v-model="temp.accessKeySecret"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button :loading="loading" type="primary" @click="dialogStatus==='create'?createData():updateData()">{{
          $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { fetchAccountList, createAccount, updateAccount, deleteAccount } from '@/api/go'
  import waves from '@/directive/waves' // Waves directive

  export default {
    name: 'ComplexTable',
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          normal: 'success',
          invalid: 'danger'
        }
        return statusMap[status]
      },
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        showReviewer: false,
        loading: false,
        // 新增&编辑 对象
        temp: {
          id: undefined,
          userName: '',
          accessKeyId: '',
          accessKeySecret: '',
          balanceData: {
            availableAmount: 0.00
          },
          alertBalance: false,
          status: 'normal',
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑账号',
          create: '新建账号'
        },
        // 校验规则
        rules: {
          userName: [{ required: true, message: 'userName is required', trigger: 'change' }],
          accessKeyId: [{ required: true, message: 'userName is required', trigger: 'change' }],
          accessKeySecret: [{ required: true, message: 'userName is required', trigger: 'change' }],
        },
        downloadLoading: false
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        fetchAccountList().then(response => {
          this.list = response.data
          this.total = response.data.length

          console.log(this.list)
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      handleFilter() {
        this.getList()
      },
      resetTemp() {
        this.temp = {
          id: undefined,
          userName: '',
          accessKeyId: '',
          accessKeySecret: '',
          status: 'normal',
        }
      },
      // 新建窗口
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      // 新建账号
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading = true
            createAccount(this.temp).then(() => {
              //this.list.unshift(this.temp)
              this.loading = false
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            }).catch(() => {
              this.loading = false
            })
          }
        })
      },
      // 编辑窗口
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      // 编辑账号
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading = true
            const tempData = Object.assign({}, this.temp)
            updateAccount(tempData).then(() => {
              this.loading = false
              for (const v of this.list) {
                if (v.id === this.temp.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.temp)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
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
        deleteAccount(row.id).then(() => {
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      },
    }
  }
</script>
