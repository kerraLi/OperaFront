<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="add">{{ $t('table.add') }}
      </el-button>
      <el-input
        class="filter-item"
        v-model="temp.name"
        :placeholder="$t('table.serverInfo.name')"
        style="width: 200px; margin-left:30px"
        @keyup.enter.native="search"
        clearable/>
      <el-select
        class="filter-item"
        v-model="temp.operator"
        :placeholder="$t('table.serverInfo.operator')"
        clearable>
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"/>
      </el-select>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="search">{{ $t('table.search') }}
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      stripe
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column
        :label="$t('table.id')"
        prop="id"
        align="center"
        width="65"
        type="index"/>
      <el-table-column
        :label="$t('table.serverInfo.name')"
        min-width="80px">
        <template slot-scope="scope">
          <span
            class="link-type"
            @click="update(scope.row)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.serverInfo.ip')"
        min-width="80px">
        <template slot-scope="scope">
          <span>{{ scope.row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.serverInfo.operator')"
        min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.operator }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.serverInfo.state')"
        min-width="100px">
        <template slot-scope="scope">
          <span
            v-if="scope.row.state===1"
            class=" el-icon-circle-check-outline "/>
          <span
            v-else
            class=" el-icon-circle-close-outline"/>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.serverInfo.createTime')"
        class-name="status-col"
        min-width="100">
        <template slot-scope="scope">
          <!--<span>{{ scope.row.balanceData ? scope.row.balanceData.availableAmount : '-' }}</span>-->
          <!--<el-tag type="danger" v-if="scope.row.alertBalance">{{ $t('table.ali.account.noMoney') }}</el-tag>-->
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.actions')"
        align="center"
        width="300"
        class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="update(scope.row)">{{ $t('table.edit') }}
          </el-button>
          <el-button
            :loading="btnLoading === 'delete-'+ scope.row.id"
            size="mini"
            type="danger"
            @click="handleDelete(scope.row)">{{ $t('table.delete') }}
          </el-button>
          <el-button
            type="primary"
            size="mini"
            @click="toUpload(scope.row.id)">{{ $t('table.upload') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"/>

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="150px"
        style="width: 800px; margin-left:50px;">
        <el-form-item
          :label="$t('table.serverInfo.name')"
          prop="userName">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item
          :label="$t('table.serverInfo.ip')"
          prop="accessKeyId">
          <el-input v-model="temp.ip"/>
        </el-form-item>
        <el-form-item
          :label="$t('table.serverInfo.operator')"
          prop="accessKeySecret">
          <el-select
            v-model="temp.operator"
            :placeholder="temp.operator">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button
          :loading="loading"
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>


<script>
  import { serverList, addOrupdate, deleted } from '@/api/configManage'
  import waves from '@/directive/waves' // Waves directive
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

  export default {
    name: 'ConfigManage',
    components: { Pagination },
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
        listQuery: {
          page: 1,
          limit: 10,
          name: undefined,
          operator: undefined
        },
        listLoading: true,
        loading: false,
        btnLoading: '',
        seeSecret: false,
        // passwordType: 'password',
        // 新增&编辑 对象
        temp: {
          id: undefined,
          name: '',
          ip: '',
          operator: '',
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: this.$t('table.ali.account.update'),
          create: this.$t('table.ali.account.create'),
        },
        // 校验规则
        rules: {
          name: [{ required: true, message: 'name is required', trigger: 'change' }],
          ip: [{ required: true, message: 'ip is required', trigger: 'change' }],
          operator: [{ required: true, message: 'operator is required', trigger: 'change' }],
        },
        options: [{
          value: 'AliCloud',
          label: 'AliCloud'
        }, {
          value: 'GodAddy',
          label: 'GodAddy'
        }, {
          value: 'AwsCloud',
          label: 'AwsCloud'
        }],
        value: 'AliCloud'
      }

    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true;
        serverList(this.listQuery).then(response => {
          this.list = response.data.result.content;
          this.total = response.data.result.totalElements;
          this.page = parseInt(response.data.result.number) + 1;
          this.limit = response.data.result.size;
          this.listLoading = false
        })
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
      add() {
        this.resetTemp();
        this.dialogStatus = 'create';
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      // 新建账号
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading = true;
            addOrupdate(this.temp).then(() => {
              //this.list.unshift(this.temp)
              this.loading = false;
              this.resetTemp();
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
      // 编辑窗口
      update(row) {
        this.temp = {
          id: row.id,
          name: row.name,
          ip: row.ip,
          operator: row.operator
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
            addOrupdate(tempData).then(() => {
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
      search() {
        this.getList()
      },
      // 删除账号
      handleDelete(row) {
        this.btnLoading = 'delete-' + row.id;
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: this.$t('table.confirm'),
          cancelButtonText: this.$t('table.cancel'),
          type: 'warning'
        }).then(() => {
          deleted(row.id).then(() => {
            // const index = this.list.indexOf(row);
            // this.list.splice(index, 1);
            this.getList();
            this.$notify({
              title: this.$t('message.success'),
              message: this.$t('message.operSuccess'),
              type: 'success',
              duration: 2000
            });
            this.btnLoading = ''
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
          this.btnLoading = ''
        });
      },
      toUpload(row) {
        this.$router.push({ path: '/config/upload', query: { id: row } });
      }
    }
  }
</script>
