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
      <el-table-column :label="$t('table.user.username')" align="center" min-width="50px">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.user.nickname')" min-width="100px">
        <template slot-scope="scope">
          <el-tag :type="scope.row.role.code | roleFilter">{{ scope.row.role.name }}</el-tag>
          <span>{{ scope.row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.user.introduction')" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.introduction }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="warning" size="mini" @click="handleUpdate(scope.row)" style="width: auto;min-width: 60px;">
            {{ $t('table.user.changePassword') }}
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button size="mini" type="danger"
                     :loading="btnLoading === 'delete-'+ scope.row.id"
                     @click="handleDelete(scope.row)">{{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"/>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="150px"
               style="width: 800px; margin-left:50px;">
        <el-form-item :label="$t('table.user.username')" prop="username">
          <el-input v-model="temp.username"/>
        </el-form-item>
        <el-form-item :label="$t('table.user.nickname')" prop="nickname">
          <el-input v-model="temp.nickname"/>
        </el-form-item>
        <el-form-item :label="$t('table.user.role.role')" prop="role">
          <el-select v-model="temp.role" value-key="id" placeholder="请选择角色。">
            <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item"/>
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'" :label="$t('table.user.newPwd')" prop="newPwd">
          <el-input type="password" v-model="temp.newPwd"/>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'" :label="$t('table.user.confirmPwd')" prop="confirmPwd">
          <el-input type="password" v-model="temp.confirmPwd"/>
        </el-form-item>
        <el-form-item :label="$t('table.user.introduction')" prop="introduction">
          <el-input v-model="temp.introduction"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button :loading="loading" type="primary" @click="saveData">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { getUserList, saveUser, deleteUser, getRoleValidList } from '@/api/user'
  import { mark, unmark } from '@/api/common'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
  import waves from '@/directive/waves' // Waves directive

  export default {
    name: 'UserIndex',
    components: { Pagination },
    directives: { waves },
    filters: {
      roleFilter(code) {
        const statusMap = {
          admin: 'danger',
        };
        return statusMap[code] || 'success'
      },
    },
    data() {
      return {
        total: 0,
        tableKey: 0,
        list: null,
        listQuery: {
          page: 1,
          limit: 20,
        },
        listLoading: true,
        loading: false,
        btnLoading: '',
        seeSecret: false,
        passwordType: 'password',
        //
        roles: null,
        // 新增&编辑 对象
        temp: {
          id: undefined
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: this.$t('table.ali.account.update'),
          create: this.$t('table.ali.account.create'),
        },
        // 校验规则
        rules: {
          username: [{ required: true, message: 'username is required', trigger: 'change' }],
          nickname: [{ required: true, message: 'nickname is required', trigger: 'change' }],
          role: [{ required: true, message: 'role is required', trigger: 'change' }],
          newPwd: [{ required: true, message: 'password is required', trigger: 'change' }],
          confirmPwd: [{ required: true, message: 'password is required', trigger: 'change' }]
        },
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true;
        getUserList(this.listQuery).then(response => {
          let data = response.data;
          this.list = data.items;
          this.total = data.total;
          this.listLoading = false;
        })
      },
      getValidRoles() {
        if (!this.roles) {
          getRoleValidList().then(response => {
            this.roles = response.data;
          })
        }
      },
      // 新建窗口
      handleCreate() {
        this.getValidRoles();
        this.temp = {
          id: undefined
        };
        this.dialogStatus = 'create';
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      // 编辑窗口
      handleUpdate(row) {
        this.getValidRoles();
        // 防止修改值改变原队列：复制对象
        this.temp = Object.assign({}, row);
        // copy obj
        this.dialogStatus = 'update';
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      // 新建账号
      saveData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.temp.password = this.temp.confirmPwd;
            this.loading = true;
            saveUser(this.temp).then(() => {
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
      // 删除
      handleDelete(row) {
        this.btnLoading = 'delete-' + row.id;
        deleteUser(row.id).then(() => {
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
    }
  }
</script>
