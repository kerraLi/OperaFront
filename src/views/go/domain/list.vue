<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input placeholder="Key" v-model="listQuery.key" style="width: 200px;" clearable class="filter-item"
                @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.status" placeholder="Status" clearable class="filter-item"
                 style="width: 130px">
        <el-option v-for="item in statusOptionsChoice" :key="item.key" :label="item.display_name"
                   :value="item.key"/>
      </el-select>
      <el-checkbox v-model="listQuery.ifExpired" class="filter-item" style="margin-left:15px;margin-right: 15px;">
        即将过期
      </el-checkbox>
      <el-checkbox v-model="listQuery.ifMarked" class="filter-item" style="margin-left:15px;margin-right: 15px;">
        标记弃用
      </el-checkbox>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search"
                 :loading="btnLoading === 'search'"
                 @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-check"
                 :loading="btnLoading === 'allmark'"
                 @click="handleModifyMarkedAll(true)">
        {{ $t('table.allDeprecated') }}
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-close"
                 :loading="btnLoading === 'allunmark'"
                 @click="handleModifyMarkedAll(false)">
        {{ $t('table.allNoDeprecated') }}
      </el-button>
      <span style="margin-left: 8px;font-size: 0.7rem;color: gray;">注：默认不显示被弃用数据 & 弃用数据不会报警</span>
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
      <!--<el-table-column :label="$t('table.id')" prop="id" align="center" width="65">-->
      <!--<template slot-scope="scope">-->
      <!--<span>{{ scope.row.id }}</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column label="AccessKeyId" min-width="100px">-->
      <!--<template slot-scope="scope">-->
      <!--<span>{{ scope.row.accessKeyId }}</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column label="UserName" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="CreatedAt" width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createdAt | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Expires" width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.expires | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <el-tag type="danger" v-if="scope.row.alertExpired">即将到期</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="renewDeadline" width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.renewDeadline | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Domain" class-name="status-col" min-width="300">
        <template slot-scope="scope">
          <p>{{ scope.row.domain }}</p>
          <p>{{ scope.row.domainId }}</p>
          <el-tag type="danger" v-if="scope.row.alertMarked">弃用数据</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" min-width="100px" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="100" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.alertMarked" size="mini" type="danger"
                     :loading="btnLoading === 'deprecated-'+ scope.row.id"
                     @click="handleModifyMarked(scope.row,true)">弃用
          </el-button>
          <el-button v-if="scope.row.alertMarked" size="mini" type="success" style="width: 66px"
                     :loading="btnLoading === 'noDeprecated-'+ scope.row.id"
                     @click="handleModifyMarked(scope.row,false)">取消弃用
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"/>

  </div>
</template>

<script>
  import { fetchDomainList } from '@/api/go'
  import { ignoreSet, ignoreSetBatch } from '@/api/common'
  import waves from '@/directive/waves' // Waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

  const statusOptionsChoice = [
    { key: 'ACTIVE', display_name: 'ACTIVE' },
    { key: 'OTHERS', display_name: 'OTHERS' }
  ];

  export default {
    name: 'ComplexTable',
    components: { Pagination },
    directives: { waves },
    filters: {
      timeFilters(date) {
        if (date === undefined) {
          return '-'
        }
        // 毫秒转秒
        let timestamp = date.time / 1000;
        return parseTime(timestamp);
      },
      statusFilter(status) {
        const statusMap = {
          ACTIVE: 'success',
        };
        return statusMap[status] || 'danger'
      }
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        btnLoading: '',
        listQuery: {
          page: 1,
          limit: 20,
          key: undefined,
          status: undefined,
          ifExpired: undefined,
          ifMarked: undefined,
        },
        temp: {
          id: undefined,
          accessKeyId: '',
        },
        statusOptionsChoice,
        showReviewer: false,
        pvData: [],
        downloadLoading: false,
        checkList: []
      }
    },
    created() {
      this.getList()
    },
    methods: {
      // 切换标记
      handleChecked(val) {
        this.checkList = val;
      },
      // 列表数据
      getList() {
        this.listLoading = true;
        fetchDomainList(this.listQuery).then(response => {
          let res = response.data;
          this.list = res.result.content;
          this.total = res.result.totalElements;

          this.listLoading = false;
          this.btnLoading = '';
        })
      },
      // 标记弃用
      handleModifyMarked(row, ifMarked) {
        let status = ifMarked ? 'mark' : 'unmark';
        let tmp = {
          'domain': 'GodaddyDomain',
          'markKey': 'domainId',
          'markValue': row['domainId'],
        };
        this.btnLoading = status + '-' + row.id;
        ignoreSet(status, tmp).then(response => {
          this.$message({
            message: '操作成功',
            type: 'success'
          });
          row.alertMarked = ifMarked;
          setTimeout(() => {
            this.btnLoading = '';
          }, 1000);
        })
      },
      // 批量标记
      handleModifyMarkedAll(ifMarked) {
        this.listLoading = true;
        const tmps = this.checkList.map((c) => {
          return {
            'domain': 'GodaddyDomain',
            'markKey': 'domainId',
            'markValue': c['domainId'],
          };
        });
        let status = ifMarked ? 'mark' : 'unmark';
        this.btnLoading = 'all' + status;
        ignoreSetBatch(status, tmps).then(response => {
          this.$notify({
            title: this.$t('message.success'),
            message: this.$t('message.operSuccess'),
            type: 'success',
            duration: 2000
          });
          this.getList()
        });
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
