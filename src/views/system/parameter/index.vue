<template>
  <div class="app-container">
    <div style="width: 60%;">
      <div class="filter-container">
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
                   @click="handleCreate">{{ $t('table.add') }}
        </el-button>
      </div>

      <el-table
        v-loading="listLoading"
        :key="tableKey"
        :data="list"
        fit
        border
        highlight-current-row
        style="width: 100%;">
        <!--<el-table-column :label="$t('table.id')" prop="id" align="center" type="index"/>-->
        <el-table-column :label="$t('table.key')">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status ==='fixed'" type="success" style="margin-right: 10px;">
              {{ $t('table.systemKey') }}
            </el-tag>
            <span v-if="scope.row.status !=='fixed'" @click="handleDelete(scope.row)"
                  style="cursor: pointer;margin-right: 10px;">
              <svg-icon icon-class="delete"/>
            </span>
            <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.key }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.value')">
          <template slot-scope="scope">
            <template v-if="scope.row.edit">
              <el-input v-model="scope.row.value" class="edit-input" size="small" style="width: 90%;"/>
              <span @click="cancelEdit(scope.row)" style="cursor: pointer;margin-left: 5px;margin-right: 5px;">
                <svg-icon icon-class="cancel"/>
              </span>
              <span @click="confirmEdit(scope.row)" style="cursor: pointer;">
                <svg-icon icon-class="confirm"/>
              </span>
            </template>
            <template v-else>
              <span>{{ scope.row.value }}</span>
              <span @click="scope.row.edit=!scope.row.edit" style="cursor: pointer;margin-left: 10px;">
                <svg-icon icon-class="edit"/>
              </span>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>


    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="150px"
               style="width: 800px; margin-left:50px;">
        <el-form-item :label="$t('table.key')" prop="key">
          <el-input v-model="temp.key"/>
        </el-form-item>
        <el-form-item :label="$t('table.value')" prop="value">
          <el-input v-model="temp.value"/>
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
  import { fetchList, create, update, remove } from '@/api/system'

  export default {
    name: "Parameter",
    filters: {
      fixedFilter(status) {
        return status === 'fixed';
      }
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        listLoading: false,
        btnLoading: '',
        loading: false,
        // 新增&编辑 对象
        temp: {
          id: undefined,
          key: '',
          value: '',
          status: '',
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: this.$t('table.ali.account.update'),
          create: this.$t('table.ali.account.create'),
        },
        // 校验规则
        rules: {
          key: [{ required: true, message: 'key is required', trigger: 'change' }],
          value: [{ required: true, message: 'value is required', trigger: 'change' }]
        },
      }
    },
    created() {
      this.getList()
    },
    methods: {
      // 获取数据
      getList() {
        this.listLoading = true;
        fetchList().then(response => {
          this.listLoading = false;
          this.list = response.data.map(v => {
            this.$set(v, 'edit', false); // https://vuejs.org/v2/guide/reactivity.html
            v.originalValue = v.value;//  will be used when user click the cancel botton
            return v
          })
        })
      },
      // 重置temp
      resetTemp() {
        this.temp = {
          id: undefined,
          key: '',
          value: '',
          status: 'temp',
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
      // 新建
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading = true;
            create(this.temp.key, this.temp.value).then((response) => {
              this.$set(response.data, 'edit', false);
              response.data.originalValue = response.data.value;
              this.list.push(response.data);
              this.dialogFormVisible = false;
              this.loading = false;
              this.$notify({
                title: this.$t('message.success'),
                message: this.$t('message.operSuccess'),
                type: 'success',
                duration: 2000
              });
            }).catch(() => {
              this.loading = false
            })
          }
        })
      },
      // 取消编辑
      cancelEdit(row) {
        row.value = row.originalValue;
        row.edit = false;
        this.$message({
          message: this.$t('message.parameter.valueToOrigin'),
          type: 'warning'
        })
      },
      // 确认编辑
      confirmEdit(row) {
        this.listLoading = true;
        row.value = row.value.trim();
        update(row.id, row.value).then(() => {
          this.listLoading = false;
          row.edit = false;
          row.originalValue = row.value;
          this.$notify({
            title: this.$t('message.success'),
            message: this.$t('message.operSuccess'),
            type: 'success',
            duration: 2000
          })
        }).catch(() => {
          this.listLoading = false;
        });
      },
      // 删除
      handleDelete(row) {
        if (this.btnLoading === 'delete-' + row.id) {
          return;
        }
        if (row.status === 'fixed') {
          this.$message({
            message: this.$t('message.parameter.fixedNoRemove'),
            type: 'error',
            duration: 5 * 1000
          });
          return;
        }
        this.btnLoading = 'delete-' + row.id;
        remove(row.id).then(() => {
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

<style scoped>

</style>
