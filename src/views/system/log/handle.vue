<template>
  <div class="app-container">
    <div class="filter-container">
      <!--筛选条件-->
      <el-select v-model="listQuery.key" :placeholder="$t('table.log.selectFilterCondition')" clearable
                 class="filter-item">
        <el-option v-for="item in filterOptionChoice" :key="item.key" :label="item.display_name"
                   :value="item.key"/>
      </el-select>
      <el-input :placeholder="$t('table.log.inputFilterValue')" v-model="listQuery.value" style="width: 200px;"
                class="filter-item"
                @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.status" placeholder="Status" clearable class="filter-item"
                 style="width: 130px">
        <el-option v-for="item in statusOptionsChoice" :key="item.key" :label="item.display_name"
                   :value="item.key"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search"
                 :loading="btnLoading === 'search'"
                 @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      row-key="id"
      style="width: 100%;">
      </el-table-column>
      <el-table-column :label="$t('table.id')" prop="id" align="center" width="65" type="index"/>
      <el-table-column :label="$t('table.log.username')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}({{ scope.row.userId }})</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.log.path')" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.log.time')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.log.inParam')" min-width="200px">
        <template slot-scope="scope">
          <span>{{ scope.row.inParam }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.log.outParam')" min-width="200px">
        <template slot-scope="scope">
          <span>{{ scope.row.outParam }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.log.ip')" min-width="50px">
        <template slot-scope="scope">
          <span>{{ scope.row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"/>

  </div>
</template>

<script>
  import { fetchHandleLog } from '@/api/system'
  import waves from '@/directive/waves' // Waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

  const filterOptionChoice = [
    { key: 'username', display_name: 'username' },
    { key: 'userId', display_name: 'userId' },
    { key: 'path', display_name: 'path' },
    { key: 'ip', display_name: 'ip' }
  ];
  const statusOptionsChoice = [
    { key: 'unfinished', display_name: 'unfinished' },
    { key: 'normal', display_name: 'normal' },
    { key: 'error', display_name: 'error' }
  ];

  export default {
    name: 'LogHandle',
    components: { Pagination },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          unfinished: 'info',
          normal: 'success',
          error: 'danger'
        };
        return statusMap[status]
      }
    },
    data() {
      return {
        list: null,
        total: 0,
        listLoading: true,
        btnLoading: '',
        listQuery: {
          page: 1,
          limit: 20,
          key: undefined,
          value: undefined,
          status: undefined,
        },
        filterOptionChoice,
        statusOptionsChoice,
      }
    },
    created() {
      this.getList()
    },
    methods: {
      // 列表数据
      getList() {
        this.listLoading = true;
        let params = {
          page: this.listQuery.page,
          limit: this.listQuery.limit,
          status: this.listQuery.status
        };

        if (this.listQuery.key !== undefined) {
          params[this.listQuery.key] = this.listQuery.value.trim()
        }
        fetchHandleLog(params).then(response => {
          this.list = response.data.items;
          this.total = response.data.total;
          this.listLoading = false;
          this.btnLoading = '';
        })
      },
      // 搜索
      handleFilter() {
        this.btnLoading = 'search';
        this.listQuery.page = 1;
        this.getList()
      },
    }
  }
</script>
