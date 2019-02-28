<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
                 @click="handleCreate">{{ $t('table.add') }}
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
      <el-table-column :label="$t('table.monitor.address')" align="center">
        <template slot-scope="scope">
          <el-tag type="info">{{ scope.row.location }}</el-tag>
          <span>{{ scope.row.address }}</span><span v-if="scope.row.operator">[{{ scope.row.operator }}]</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.monitor.path')" align="center">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.path }}</span>
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
        <el-form-item :label="$t('table.monitor.location')" prop="location">
          <el-select v-model="temp.location" placeholder="请选择地区（与测速地图对应）。" style="width: 50%;">
            <el-option v-for="item in locationChoice" :key="item.key" :label="item.value" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.monitor.address')" prop="address">
          <el-input v-model="temp.address"/>
        </el-form-item>
        <el-form-item :label="$t('table.monitor.path')" prop="path">
          <el-input v-model="temp.path"/>
        </el-form-item>
        <el-form-item :label="$t('table.monitor.operator')" prop="operator">
          <el-select v-model="temp.operator" clearable placeholder="请选择运营商，可为空。" style="width: 50%;">
            <el-option v-for="item in operatorsChoice" :key="item.key" :label="item.value" :value="item.value"/>
          </el-select>
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

  </div>
</template>

<script>
  import { fetchPointList, savePoint, deletePoint, deleteAllPoint } from '@/api/monitor'
  import waves from '@/directive/waves' // Waves directive
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

  const operatorsChoice = [
    { key: '移动', value: '移动' },
    { key: '联通', value: '联通' },
    { key: '电信', value: '电信' },
    { key: '铁通', value: '铁通' }
  ];

  const locationChoice = [
    { key: '黑龙江', value: '黑龙江' },
    { key: '吉林', value: '吉林' },
    { key: '辽宁', value: '辽宁' },
    { key: '河南', value: '河南' },
    { key: '河北', value: '河北' },
    { key: '北京', value: '北京' },
    { key: '天津', value: '天津' },
    { key: '山东', value: '山东' },
    { key: '山西', value: '山西' },
    { key: '江苏', value: '江苏' },
    { key: '上海', value: '上海' },
    { key: '浙江', value: '浙江' },
    { key: '安徽', value: '安徽' },
    { key: '江西', value: '江西' },
    { key: '福建', value: '福建' },
    { key: '陕西', value: '陕西' },
    { key: '湖北', value: '湖北' },
    { key: '湖南', value: '湖南' },
    { key: '广东', value: '广东' },
    { key: '香港', value: '香港' },
    { key: '澳门', value: '澳门' },
    { key: '海南', value: '海南' },
    { key: '青海', value: '青海' },
    { key: '甘肃', value: '甘肃' },
    { key: '宁夏', value: '宁夏' },
    { key: '四川', value: '四川' },
    { key: '重庆', value: '重庆' },
    { key: '贵州', value: '贵州' },
    { key: '云南', value: '云南' },
    { key: '广西', value: '广西' },
    { key: '西藏', value: '西藏' },
    { key: '新疆', value: '新疆' },
    { key: '内蒙古', value: '内蒙古' },
    { key: '南海诸岛', value: '南海诸岛' },
  ];
  export default {
    name: "MonitorPoint",
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
        operatorsChoice,
        locationChoice,
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
          location: [{ required: true, message: 'location is required', trigger: 'change' }],
          // address: [{ required: true, message: 'address is required', trigger: 'change' }],
          path: [{ required: true, message: 'path is required', trigger: 'change' }],
        },
        // 多选标记
        checkList: []
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true;
        fetchPointList().then(response => {
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
            savePoint(tempData).then(() => {
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
        deletePoint(row.id).then(() => {
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
        deleteAllPoint(ids).then(response => {
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
    }
  }
</script>

<style scoped>

</style>
