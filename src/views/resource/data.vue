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
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-delete"
                 :loading="btnLoading === 'allDelete'"
                 @click="handleDeleteAll">
        {{ $t('table.allDelete') }}
      </el-button>
    </div>

    <el-table v-if="this.typeCode==='menu'"/>
    <el-table
      v-else
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
      <el-table-column v-for="item of columns" :prop="item" :label="item" :key="item">
        <template slot-scope="scope">
          <el-tag v-if="item === '状态' && scope.row[item]!==''" :type="scope.row[item] | statusFilter">
            {{ scope.row[item] }}
          </el-tag>
          <span v-else>{{ scope.row[item] }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"/>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="150px"
               style="width: 800px; margin-left:50px;">
        <el-form-item v-for="item of columns" :label="item" :prop="item">
          <el-input v-model="temp[item]"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button :loading="loading" type="primary" @click="saveData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getCateInfo, getTypeInfo,
    fetchDataList, deleteData, deleteAllData, saveData
  } from '@/api/resource'
  import waves from '@/directive/waves' // Waves directive
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

  export default {
    name: 'Hardware',
    components: { Pagination },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          running: 'success',
          stop: 'danger'
        };
        return statusMap[status]
      },
    },
    data() {
      return {
        // cate
        cate: undefined,
        cateId: undefined,
        cateCode: '',
        // type
        type: undefined,
        typeCode: '',
        columns: [],
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
          categoryId: this.cateId,
          typeCode: this.typeCode,
          data: '',
        },
        // dialog
        loading: false,
        textMap: {
          update: this.$t('table.update'),
          create: this.$t('table.create'),
        },
        dialogStatus: '',
        dialogFormVisible: false,
        rules: {},
        // 多选标记
        checkList: []
      }
    },
    created() {
      this.getCategoryInfo();
      // this.getList()
    },
    methods: {
      // 获取分类信息
      getCategoryInfo() {
        this.listLoading = true;
        this.cateCode = this.$route.path.split('/').pop();
        getCateInfo(this.cateCode).then(response => {
          this.cate = response.data;
          this.cateId = this.cate.id;
          if (this.cate.type === "menu") {
            this.typeCode = "menu";
            this.columns = [];
            this.listLoading = false;
          } else {
            getTypeInfo(this.cate.type).then(response => {
              this.type = response.data;
              this.typeCode = this.type.code;
              this.columns = JSON.parse(this.type.column);
              this.getList();
            });
          }
        });
      },
      // 切换标记
      handleChecked(val) {
        this.checkList = val;
      },
      // 列表数据
      getList() {
        this.listLoading = true;
        fetchDataList(this.cateId, this.listQuery).then(response => {
          this.list = response.data.items;
          this.list.forEach((v) => {
            let data = JSON.parse(v.data);
            this.columns.forEach((column, index) => {
              v[column] = data[index];
            });
          });
          this.total = response.data.total;
          this.listLoading = false;
          this.btnLoading = '';
        })
      },
      // 重置temp
      resetTemp() {
        // add&edit
        this.temp = {
          id: undefined,
          categoryId: this.cateId,
          typeCode: this.typeCode,
          data: '',
        };
      },
      // 删除
      handleDelete(row) {
        if (this.btnLoading === 'delete-' + row.id) {
          return;
        }
        this.btnLoading = 'delete-' + row.id;
        deleteData(row.id).then(() => {
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
        if (this.checkList.length <= 0) {
          return;
        }
        this.listLoading = true;
        const ids = this.checkList.map((c) => {
          return c.id;
        });
        this.btnLoading = 'allDelete';
        deleteAllData(ids).then(response => {
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
      // 新增|编辑数据
      saveData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading = true;
            this.handleDataSave();
            saveData(this.temp).then(() => {
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
      // 处理temp数据格式
      handleDataSave() {
        let tmpData = [];
        this.columns.forEach((value) => {
          tmpData.push(this.temp[value] ? this.temp[value] : '');
        });
        this.temp.data = JSON.stringify(tmpData);
      }
    }
  }
</script>


<style scoped>
  .excel-upload-input {
    display: none;
    z-index: -9999;
  }
</style>
