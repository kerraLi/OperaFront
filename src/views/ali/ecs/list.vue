<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input placeholder="Key" v-model="listQuery.key" style="width: 200px;" class="filter-item"
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
      <el-button v-waves v-loading="" class="filter-item" type="primary" icon="el-icon-check"
                 :loading="btnLoading === 'allDeprecated'"
                 @click="handleModifyMarkedAll(true)">
        {{ $t('table.allDeprecated') }}
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-close"
                 :loading="btnLoading === 'allNoDeprecated'"
                 @click="handleModifyMarkedAll(false)">
        {{ $t('table.allNoDeprecated') }}
      </el-button>
      <span style="margin-left: 8px;font-size: 0.7rem;color: gray;">注：默认不显示被弃用数据 & 弃用数据不会报警</span>
    </div>

    <el-table
      v-loading="listLoading"
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
      <el-table-column label="CreatedTime" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.creationTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="ExpiredTime" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.expiredTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <el-tag type="danger" v-if="scope.row.alertExpired">即将到期</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="HostName" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.hostName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Instance" min-width="150px">
        <template slot-scope="scope">
          <p>{{ scope.row.instanceId }}</p>
          <p>{{ scope.row.instanceName }}</p>
          <el-tag type="danger" v-if="scope.row.alertMarked">弃用数据</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="PublicIps" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.publicIps }}</span>
        </template>
      </el-table-column>
      <el-table-column label="RegionId" min-width="150px">
        <template slot-scope="scope">
          <p>{{ scope.row.regionId }}</p>
          <p>{{ scope.row.zoneId }}</p>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" class-name="status-col" width="100">
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

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"/>
        <el-table-column prop="pv" label="Pv"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import { fetchEcsList } from '@/api/ali'
  import { mark, unmark, markAll, unmarkAll } from '@/api/common'
  import waves from '@/directive/waves' // Waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

  const statusOptionsChoice = [
    { key: 'Running', display_name: 'Running' },
    { key: 'Stopped', display_name: 'Stopped' }
  ]

  export default {
    name: 'ComplexTable',
    components: { Pagination },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          Running: 'success',
          Stopped: 'danger'
        }
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
          status: undefined,
          ifExpired: undefined,
          ifMarked: undefined
        },
        statusOptionsChoice,
        showReviewer: false,
        dialogPvVisible: false,
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
        this.listLoading = true
        fetchEcsList(this.listQuery).then(response => {
          this.list = response.data.items
          this.total = response.data.total
          this.listLoading = false
          this.btnLoading = '';
        })
      },
      // 标记弃用
      handleModifyMarked(row, ifMarked) {
        if (ifMarked) {
          this.btnLoading = 'deprecated-' + row.id;
          mark('ali', 'ecs', row.id).then(response => {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            row.alertMarked = ifMarked;
            setTimeout(() => {
              this.btnLoading = '';
            }, 1000);
          })
        } else {
          this.btnLoading = 'noDeprecated-' + row.id;
          unmark('ali', 'ecs', row.id).then(response => {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            row.alertMarked = ifMarked;
            setTimeout(() => {
              this.btnLoading = '';
            }, 1000);
          })
        }
      },
      // 批量标记
      handleModifyMarkedAll(ifMarked) {
        this.listLoading = true;
        const ids = this.checkList.map((c) => {
          return c.id;
        });
        if (ifMarked) {
          this.btnLoading = 'allDeprecated';
          markAll('ali', 'ecs', ids).then(response => {
            this.$message({
              message: '操作成功',
              type: 'success'
            });
            this.getList()
          })
        } else {
          this.btnLoading = 'allNoDeprecated';
          unmarkAll('ali', 'ecs', ids).then(response => {
            this.$message({
              message: '操作成功',
              type: 'success'
            });
            this.getList()
          })
        }
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
