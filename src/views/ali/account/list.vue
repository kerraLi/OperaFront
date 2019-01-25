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
      <el-table-column :label="$t('table.id')" prop="id" align="center" width="65" type="index"/>
      <el-table-column :label="$t('table.ali.username')" min-width="80px">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.ali.accessKeyId')" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.accessKeyId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.ali.accessKeySecret')" min-width="100px" :render-header="secretHeaderRender">
        <template slot-scope="scope">
          <span v-if="seeSecret">{{ scope.row.accessKeySecret }}</span>
          <span v-if="!seeSecret">************************</span>
        </template>
      </el-table-column>
      <el-table-column label="Money" class-name="status-col" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.balanceData ? scope.row.balanceData.availableAmount : '-' }}</span>
          <el-tag type="danger" v-if="scope.row.alertBalance">{{ $t('table.ali.account.noMoney') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.alarm')" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tooltip :content="'Switch value: ' + scope.row.alertMarked" placement="top">
            <el-switch
              :value="!scope.row.alertMarked"
              @change="handleSwitchMark(scope.row)"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
          </el-tooltip>
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
        <el-form-item :label="$t('table.ali.username')" prop="userName">
          <el-input v-model="temp.userName"/>
        </el-form-item>
        <el-form-item :label="$t('table.ali.accessKeyId')" prop="accessKeyId">
          <el-input v-model="temp.accessKeyId"/>
        </el-form-item>
        <el-form-item :label="$t('table.ali.accessKeySecret')" prop="accessKeySecret">
          <el-input :type="passwordType" v-model="temp.accessKeySecret">
            <i slot="suffix" class="el-icon-view" @click="openSeeSecret" style="margin-right:10px;cursor:pointer;"></i>
          </el-input>
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
  import { fetchAccountList, createAliAccount, updateAliAccount, deleteAliAccount } from '@/api/ali'
  import { mark, unmark } from '@/api/common'
  import waves from '@/directive/waves' // Waves directive

  export default {
    name: 'ComplexTable',
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
        showReviewer: false,
        loading: false,
        btnLoading: '',
        seeSecret: false,
        passwordType: 'password',
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
          update: this.$t('table.ali.account.update'),
          create: this.$t('table.ali.account.create'),
        },
        // 校验规则
        rules: {
          userName: [{ required: true, message: 'userName is required', trigger: 'change' }],
          accessKeyId: [{ required: true, message: 'accessKeyId is required', trigger: 'change' }],
          accessKeySecret: [{ required: true, message: 'accessKeySecret is required', trigger: 'change' }],
        },
        downloadLoading: false
      }
    },
    created() {
      this.getList()
    },
    methods: {
      secretHeaderRender(h, { column }) {
        return (
          h('span', [
            h('span', column.label),
            h('i', {
              class: 'el-icon-view',
              style: 'margin-left:20px;cursor:pointer;',
              on: {
                click: () => {
                  this.openSeeSecret()
                }
              }
            })
          ])
        )
      },
      openSeeSecret() {
        this.seeSecret = !(this.seeSecret);
        this.passwordType = this.passwordType === 'password' ? '' : 'password';
      },
      getList() {
        this.listLoading = true
        fetchAccountList().then(response => {
          this.list = response.data
          this.total = response.data.length
          this.listLoading = false
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
            createAliAccount(this.temp).then(() => {
              //this.list.unshift(this.temp)
              this.loading = false
              this.getList()
              this.dialogFormVisible = false
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
      // 编辑窗口
      handleUpdate(row) {
        this.temp = {
          id: row.id,
          userName: row.userName,
          accessKeyId: row.accessKeyId,
          accessKeySecret: row.accessKeySecret
        };
        // copy obj
        this.dialogStatus = 'update';
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      // 编辑账号
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading = true;
            const tempData = Object.assign({}, this.temp);
            updateAliAccount(tempData).then(() => {
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
        deleteAliAccount(row.id).then(() => {
          const index = this.list.indexOf(row);
          this.list.splice(index, 1);
          this.$notify({
            title: this.$t('message.success'),
            message: this.$t('message.operSuccess'),
            type: 'success',
            duration: 2000
          });
          this.btnLoading = ''
        })
      },
      // 报警开关
      handleSwitchMark(row) {
        this.listLoading = true;
        if (row.alertMarked) {
          //打开报警=》删除mark
          unmark('ali', 'account', row.id).then(response => {
            this.$notify({
              title: this.$t('message.success'),
              message: this.$t('message.operSuccess'),
              type: 'success',
              duration: 2000
            });
            row.alertMarked = !row.alertMarked;
            setTimeout(() => {
              this.listLoading = false;
            }, 1000);
          })
        } else {
          //关闭报警=》设置mark
          mark('ali', 'account', row.id).then(response => {
            this.$notify({
              title: this.$t('message.success'),
              message: this.$t('message.operSuccess'),
              type: 'success',
              duration: 2000
            });
            row.alertMarked = !row.alertMarked;
            setTimeout(() => {
              this.listLoading = false;
            }, 1000);
          })
        }
      }
    }
  }
</script>
