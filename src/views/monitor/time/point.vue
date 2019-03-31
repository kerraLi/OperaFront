<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh"
                 @click="getList">{{ $t('table.refresh') }}
      </el-button>
      <span @click="openHowToBuild" style="cursor:pointer;margin-left: 8px;font-size: 0.7rem;color: gray;">
        <i class="el-icon-question"></i>
        {{ $t('table.monitor.buildButton') }}
      </span>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      row-key="id"
      style="width: 100%;">
      <el-table-column :label="$t('table.id')" prop="id" align="center" width="65" type="index"/>
      <el-table-column :label="$t('table.monitor.host')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.host }}:{{ scope.row.port }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.monitor.name')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.monitor.publishNum')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.publish }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.state | statusFilter">{{ scope.row.state }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="$t('table.monitor.buildInfo')"
      :visible.sync="dialogBuildVisible"
      width="30%"
      center>
      <markdown-viewer v-model="content"/>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogBuildVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import { fetchTimePointList } from '@/api/monitor'
  import waves from '@/directive/waves' // Waves directive
  import Pagination from '@/components/Pagination'
  import Icons from "@/views/svg-icons/index"; // Secondary package based on el-pagination
  import MarkdownViewer from '@/components/MarkdownViewer'

  const content = `
**具体见：**[http://10.10.25.83/devops/yunweiplatform](http://10.10.25.83/devops/yunweiplatform)
`;

  export default {
    name: "MonitorPoint",
    components: { Icons, Pagination, MarkdownViewer },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          running: 'success'
        };
        return statusMap[status] ? statusMap[status] : 'danger'
      },
    },
    data() {
      return {
        content: content,
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20,
          key: undefined,
        },
        dialogBuildVisible: false
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true;
        fetchTimePointList().then(response => {
          this.list = response.data;
          // Just to simulate the time of the request
          this.listLoading = false
        })
      },
      openHowToBuild() {
        this.dialogBuildVisible = true;
      }
    }
  }
</script>

<style scoped>

</style>
