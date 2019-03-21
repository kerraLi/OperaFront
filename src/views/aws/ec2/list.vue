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
      <el-table-column :label="$t('table.id')" prop="id" align="center" width="65" type="index"/>
      <el-table-column :label="$t('table.aws.username')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.region')" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.region }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.launchTime')" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.launchTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.imageId')" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.imageId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.instanceId')" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.instanceId }}</span>
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.instanceType')" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.instanceType }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.keyName')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.keyName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.platform')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.platform }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.privateDnsName')" min-width="200px">
        <template slot-scope="scope">
          <span>{{ scope.row.privateDnsName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.privateIpAddress')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.privateIpAddress }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.publicDnsName')" min-width="200px">
        <template slot-scope="scope">
          <span>{{ scope.row.publicDnsName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.publicIpAddress')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.publicIpAddress }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.subnetId')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.subnetId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.vpcId')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.vpcId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.architecture')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.architecture }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.rootDeviceName')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.rootDeviceName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.aws.rootDeviceType')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.rootDeviceType }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"/>

  </div>
</template>

<script>
  import { fetchEc2List } from '@/api/aws'
  import waves from '@/directive/waves' // Waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

  const statusOptionsChoice = [
    { key: 'running', display_name: 'running' },
    { key: 'others', display_name: 'others' }
  ];

  export default {
    name: 'Ec2List',
    components: { Pagination },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          running: 'success'
        };
        return statusMap[status] === undefined ? 'warning' : statusMap[status]
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
        },
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
        fetchEc2List(this.listQuery).then(response => {
          let res = response.data;
          this.list = res.result.content;
          this.total = res.result.totalElements;
          this.listLoading = false;
          this.btnLoading = '';
        }).catch(() => {
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
