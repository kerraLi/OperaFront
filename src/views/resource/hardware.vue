<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input placeholder="Key" v-model="listQuery.key" style="width: 200px;" class="filter-item"
                @keyup.enter.native="handleFilter"/>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search"
                 :loading="btnLoading === 'search'"
                 @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
                 @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
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
        width="40"
      >
      </el-table-column>
      <el-table-column :label="$t('table.id')" prop="id" align="center" width="65" type="index"/>
      <el-table-column :label="$t('table.actions')" align="center" width="100" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <span @click="handleDelete(scope.row)"
                style="cursor: pointer;margin-right: 10px;">
            <svg-icon icon-class="delete"/>
          </span>
          <span @click="handleUpdate(scope.row)"
                style="cursor: pointer;">
            <svg-icon icon-class="edit"/>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.username')">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.password')">
        <template slot-scope="scope">
          <span>{{ scope.row.password }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.cabinet')">
        <template slot-scope="scope">
          <span>{{ scope.row.cabinet }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.model')">
        <template slot-scope="scope">
          <span>{{ scope.row.model }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.assetNumber')">
        <template slot-scope="scope">
          <span>{{ scope.row.assetNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.sn')">
        <template slot-scope="scope">
          <span>{{ scope.row.sn }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.operateSystem')">
        <template slot-scope="scope">
          <span>{{ scope.row.operateSystem }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.effect')">
        <template slot-scope="scope">
          <span>{{ scope.row.effect }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.externalIp')">
        <template slot-scope="scope">
          <span>{{ scope.row.externalIp }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.externalMainLine')">
        <template slot-scope="scope">
          <span>{{ scope.row.externalMainLine }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.externalBackupLine')">
        <template slot-scope="scope">
          <span>{{ scope.row.externalBackupLine }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.intranetIp')">
        <template slot-scope="scope">
          <span>{{ scope.row.intranetIp }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.manageCardIp')">
        <template slot-scope="scope">
          <span>{{ scope.row.manageCardIp }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.mask')">
        <template slot-scope="scope">
          <span>{{ scope.row.mask }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.remotePort')">
        <template slot-scope="scope">
          <span>{{ scope.row.remotePort }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.intranetPort')">
        <template slot-scope="scope">
          <span>{{ scope.row.intranetPort }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.managePort')">
        <template slot-scope="scope">
          <span>{{ scope.row.managePort }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.externalPort')">
        <template slot-scope="scope">
          <span>{{ scope.row.externalPort }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.cpu')">
        <template slot-scope="scope">
          <span>{{ scope.row.cpu }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.memory')">
        <template slot-scope="scope">
          <span>{{ scope.row.memory }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.raid')">
        <template slot-scope="scope">
          <span>{{ scope.row.raid }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.hardDisk')">
        <template slot-scope="scope">
          <span>{{ scope.row.hardDisk }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.power')">
        <template slot-scope="scope">
          <span>{{ scope.row.power }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.uNumber')">
        <template slot-scope="scope">
          <span>{{ scope.row.uNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.remark')">
        <template slot-scope="scope">
          <span>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"/>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="150px"
               style="width: 800px; margin-left:50px;">
        <el-form-item :label="$t('table.resource.username')" prop="username">
          <el-input v-model="temp.username"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.password')" prop="password">
          <el-input v-model="temp.password"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.cabinet')" prop="cabinet">
          <el-input v-model="temp.cabinet"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.model')" prop="model">
          <el-input v-model="temp.model"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.assetNumber')" prop="assetNumber">
          <el-input v-model="temp.assetNumber"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.sn')" prop="sn">
          <el-input v-model="temp.sn"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.operateSystem')" prop="operateSystem">
          <el-input v-model="temp.operateSystem"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.effect')" prop="effect">
          <el-input v-model="temp.effect"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.externalIp')" prop="externalIp">
          <el-input v-model="temp.externalIp"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.externalMainLine')" prop="externalMainLine">
          <el-input v-model="temp.externalMainLine"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.externalBackupLine')" prop="externalBackupLine">
          <el-input v-model="temp.externalBackupLine"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.intranetIp')" prop="intranetIp">
          <el-input v-model="temp.intranetIp"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.manageCardIp')" prop="manageCardIp">
          <el-input v-model="temp.manageCardIp"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.mask')" prop="mask">
          <el-input v-model="temp.mask"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.remotePort')" prop="remotePort">
          <el-input v-model="temp.remotePort"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.intranetPort')" prop="intranetPort">
          <el-input v-model="temp.intranetPort"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.managePort')" prop="managePort">
          <el-input v-model="temp.managePort"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.externalPort')" prop="externalPort">
          <el-input v-model="temp.externalPort"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.intranetPort')" prop="intranetPort">
          <el-input v-model="temp.intranetPort"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.cpu')" prop="cpu">
          <el-input v-model="temp.cpu"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.memory')" prop="memory">
          <el-input v-model="temp.memory"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.raid')" prop="raid">
          <el-input v-model="temp.raid"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.hardDisk')" prop="hardDisk">
          <el-input v-model="temp.hardDisk"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.power')" prop="power">
          <el-input v-model="temp.power"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.uNumber')" prop="uNumber">
          <el-input v-model="temp.uNumber"/>
        </el-form-item>
        <el-form-item :label="$t('table.resource.remark')" prop="remark">
          <el-input v-model="temp.remark"/>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button :loading="loading" type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { fetchHardwareList, deleteHardware, deleteAllHardware, createHardware, updateHardware } from '@/api/resource'
  import waves from '@/directive/waves' // Waves directive
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
  import XLSX from 'xlsx'

  export default {
    name: 'Hardware',
    components: { Pagination },
    directives: { waves },
    data() {
      return {
        tableKey: 0,
        // 列表
        list: null,
        // 总数
        total: 0,
        listLoading: true,
        btnLoading: '',
        listQuery: {
          page: 1,
          limit: 20,
          key: undefined,
        },
        // add&edit
        temp: {
          id: undefined,
          username: '',
          password: '',
          cabinet: '',
          model: '',
          assetNumber: '',
          sn: '',
          operateSystem: '',
          effect: '',
          externalIp: '',
          externalMainLine: '',
          externalBackupLine: '',
          intranetIp: '',
          manageCardIp: '',
          mask: '',
          remotePort: '',
          intranetPort: '',
          managePort: '',
          externalPort: '',
          cpu: '',
          memory: '',
          raid: '',
          hardDisk: '',
          power: '',
          uNumber: '',
          remark: '',
        },
        // dialog
        loading: false,
        textMap: {
          update: this.$t('table.update'),
          create: this.$t('table.create'),
        },
        dialogStatus: '',
        dialogFormVisible: false,
        rules: {
          cabinet: [{ required: true, message: 'cabinet is required', trigger: 'change' }],
        },
        // 页码
        pvData: [],
        // 多选标记
        checkList: []
      }
    },
    created() {
      this.getList()
    },
    methods: {
      // 重置temp
      resetTemp() {
        this.temp = {
          id: undefined,
          username: '',
          password: '',
          cabinet: '',
          model: '',
          assetNumber: '',
          sn: '',
          operateSystem: '',
          effect: '',
          externalIp: '',
          externalMainLine: '',
          externalBackupLine: '',
          intranetIp: '',
          manageCardIp: '',
          mask: '',
          remotePort: '',
          intranetPort: '',
          managePort: '',
          externalPort: '',
          cpu: '',
          memory: '',
          raid: '',
          hardDisk: '',
          power: '',
          uNumber: '',
          remark: '',
        }
      },
      // 切换标记
      handleChecked(val) {
        this.checkList = val;
      },
      // 列表数据
      getList() {
        this.listLoading = true;
        fetchHardwareList(this.listQuery).then(response => {
          this.list = response.data.items;
          this.total = response.data.total;
          this.listLoading = false;
          this.btnLoading = '';
        })
      },
      // 删除
      handleDelete(row) {
        if (this.btnLoading === 'delete-' + row.id) {
          return;
        }
        this.btnLoading = 'delete-' + row.id;
        deleteHardware(row.id).then(() => {
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
      // 批量删除
      handleDeleteAll() {
        this.listLoading = true;
        const ids = this.checkList.map((c) => {
          return c.id;
        });
        this.btnLoading = 'allDelete';
        deleteAllHardware(ids).then(response => {
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
      // 搜索
      handleFilter() {
        this.btnLoading = 'search';
        this.listQuery.page = 1;
        this.getList()
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
        this.temp = row;
        // copy obj
        this.dialogStatus = 'update';
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
            createHardware(this.temp).then(() => {
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
      // 编辑账号
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading = true;
            const tempData = Object.assign({}, this.temp);
            updateHardware(tempData).then(() => {
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
    }
  }
</script>


<style scoped>
  .excel-upload-input {
    display: none;
    z-index: -9999;
  }
</style>
