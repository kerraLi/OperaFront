<template>
  <div>
    <permission-choice @closePer="closePer" v-if="tempRole" :role="tempRole"/>

    <div v-else class="app-container">
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
        <el-table-column :label="$t('table.user.role.code')" min-width="80px">
          <template slot-scope="scope">
            <span class="link-type">{{ scope.row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.user.role.name')" min-width="100px">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.actions')" align="center" width="300" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button v-if="scope.row.code !=='admin'" type="warning" size="mini" @click="handleAssign(scope.row)"
                       style="width: auto;min-width: 60px;">
              {{ $t('table.user.assignPermission') }}
            </el-button>
            <el-button v-if="scope.row.code !=='admin'" type="primary" size="mini" @click="handleUpdate(scope.row)">
              {{ $t('table.edit') }}
            </el-button>
            <el-button v-if="scope.row.code !=='admin'" size="mini" type="danger"
                       :loading="btnLoading === 'delete-'+ scope.row.id"
                       @click="handleDelete(scope.row)">
              {{ $t('table.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>


      <el-dialog :title="dialogTextMap[dialogStatus]" :visible.sync="dialogFormVisible" width="30%">
        <el-form ref="dataForm" :rules="dialogFormRules" :model="temp" label-width="80px" style="width: 90%;">
          <el-form-item :label="$t('table.user.role.code')" prop="code">
            <el-input v-model="temp.code"/>
          </el-form-item>
          <el-form-item :label="$t('table.user.role.name')" prop="name">
            <el-input v-model="temp.name"/>
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
  </div>
</template>

<script>
  import { getRoleList, saveRole, removeRole } from '@/api/user'
  import PermissionChoice from './components/PermissionChoice'
  import waves from '@/directive/waves' // Waves directive

  const checkAlpha = (rule, value, callback) => {
    if (value.length < 0 || value.length > 6) {
      callback(new Error('code必须在4至6个字符之间'))
    } else {
      let reg = /^[a-z]+$/;
      if (!reg.test(value)) {
        callback(new Error('code必须为小写英文字母组成'))
      }
      callback()
    }
  };

  export default {
    name: 'UserRole',
    directives: { waves },
    components: {
      PermissionChoice,
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        loading: false,
        btnLoading: '',
        // 新增&编辑 对象
        temp: {
          id: undefined,
          code: '',
          name: '',
        },
        // permission
        tempRole: null,
        dialogFormVisible: false,
        dialogStatus: '',
        dialogTextMap: {
          update: this.$t('table.update'),
          create: this.$t('table.create'),
        },
        // 校验规则
        dialogFormRules: {
          code: [{ required: true, message: 'code is required', trigger: 'change' },
            {
              validator: checkAlpha,
              trigger: 'change'
            }],
          name: [{ required: true, message: 'name is required', trigger: 'change' }],
        },
      }
    },
    created() {
      this.getList()
    },
    methods: {
      // 关闭权限列表事件监听
      closePer() {
        this.tempRole = null;
      },
      getList() {
        this.listLoading = true;
        getRoleList().then(response => {
          this.list = response.data;
          this.total = response.data.length;
          this.listLoading = false
        })
      },
      // 新建窗口
      handleCreate() {
        this.temp = {
          id: undefined,
          code: '',
          name: '',
        };
        this.dialogStatus = 'create';
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      // 编辑窗口
      handleUpdate(row) {
        this.temp = row;
        // copy obj
        this.dialogStatus = 'update';
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      // 分配权限
      handleAssign(row) {
        this.tempRole = row;
      },
      // 保存
      saveData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading = true;
            saveRole(this.temp).then(() => {
              //this.list.unshift(this.temp)
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
        removeRole(row.id).then(() => {
          const index = this.list.indexOf(row);
          this.list.splice(index, 1);
          this.btnLoading = '';
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
