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
        highlight-current-row
        style="width: 100%;">
        <el-table-column :label="$t('table.id')" prop="id" align="center" type="index"/>
        <el-table-column :label="$t('table.actions')" align="center" class-name="small-padding fixed-width" width="65">
          <template slot-scope="scope">
            <span @click="handleUpdate(scope.row)" style="cursor: pointer;">
              <svg-icon icon-class="edit"/>
            </span>
            <span v-if="scope.row.status !=='fixed'" @click="handleDelete(scope.row)" style="cursor: pointer;">
              <svg-icon icon-class="delete"/>
            </span>
            <!--<el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>-->
            <!--<el-button size="mini" type="danger"-->
            <!--:loading="btnLoading === 'delete-'+ scope.row.id"-->
            <!--@click="handleDelete(scope.row)">{{ $t('table.delete') }}-->
            <!--</el-button>-->
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.key')">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status ==='fixed'" type="success" style="margin-right: 10px;">{{
              $t('table.systemKey') }}
            </el-tag>
            <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.key }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.value')">
          <template slot-scope="scope">
            <span>{{ scope.row.value }}</span>
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
          this.list = response.data;
          this.listLoading = false;
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
      // 编辑窗口
      handleUpdate(row) {
        this.temp = {
          id: row.id,
          key: row.key,
          value: row.value,
          status: row.status
        };
        // copy obj
        this.dialogStatus = 'update';
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
      // 编辑value
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading = true;
            update(this.temp.id, this.temp.value).then(() => {
              for (const v of this.list) {
                if (v.id === this.temp.id) {
                  const index = this.list.indexOf(v);
                  this.list.splice(index, 1, this.temp);
                  break
                }
              }
              this.dialogFormVisible = false;
              this.loading = false;
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
