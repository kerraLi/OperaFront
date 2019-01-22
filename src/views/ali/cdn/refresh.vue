<template>
  <div class="app-container">
    <el-tabs v-model="tabActiveName" @tab-click="handleTabs">

      <!--fresh tab-->
      <el-tab-pane class="refresh-tab" :label="$t('table.refreshCache')" name="refresh">
        <el-form ref="form" :model="operForm" label-width="100px">
          <el-form-item :label="$t('table.operType')">
            <el-select v-model="operForm.operateType" @change="handleOperType" placeholder="请选择操作类型">
              <el-option v-for="item in operOptions" :key="item.index" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('table.refreshType')">
            <el-select v-model="operForm.refreshType" placeholder="请选择操作类型">
              <el-option v-for="item in operSecondOptions" :key="item.index" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('table.url')">
            <span>每日最多刷新上限2000预热上限500目录上限100。刷新任务生效时间大约为5分钟。</span>
            <el-input
              type="textarea"
              rows="5"
              placeholder="多个DOMAIN，请换行输入；请输入同一个账号下URL路径。"
              v-model="operForm.content"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small"
                       @click="handleSubmitOper"
                       :loading="btnLoading === 'submit'">
              提交
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!--fresh log-->
      <el-tab-pane :label="$t('table.operLog')" name="refresh-log">
        <div class="filter-container">
          <el-date-picker
            v-model="listQuery.operDate"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="filter-item"
            :picker-options="operDatePick"
          />
          <el-select v-model="listQuery.operType" class="filter-item"
                     style="width: 150px">
            <el-option v-for="item in operTypeSearch" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input placeholder="请输入域名或url" v-model="listQuery.url" class="filter-item" style="width: 300px;"
                    @keyup.enter.native="handleFilter"/>
          <el-button class="filter-item" type="primary" icon="el-icon-search"
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
          <el-table-column :label="$t('table.id')" prop="id" align="center" width="50px" type="index"/>
          <el-table-column label="UserName" min-width="60px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.userName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="TaskId" min-width="30px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.taskId }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.operTime')" width="150px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.creationTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.operContent')" min-width="150px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.objectPath }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.operType')" width="150px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.objectType| objectTypeFilter }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.progress')" min-width="50px" align="center">
            <template slot-scope="scope">
              <el-progress :percentage="scope.row.process | processFilter" :stroke-width="18" text-inside
                           style="display: inline-block;width: 80%;"/>
              <i v-if="scope.row.status !== 'Complete' && scope.row.status !== 'Failed'"
                 @click="handleFreshTask(scope.row)"
                 style="cursor: pointer;"
                 class="el-icon-refresh"></i>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.status')" min-width="30px" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>

      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import { createCdnRefresh, fetchCdnRefreshList, updateCdnRefreshTask } from '@/api/ali'

  const operOptions = [{
    value: 'refresh',
    label: '刷新',
    second: [{
      value: 'url',
      label: 'URL'
    }, {
      value: 'directory',
      label: '目录'
    }]
  }, {
    value: 'warm',
    label: '预热',
    second: [{
      value: 'url',
      label: 'URL'
    }]
  }];

  const operTypeSearch = [{
    value: 'all',
    label: '所有类型',
  }, {
    value: 'url-refresh',
    label: 'URL刷新',
  }, {
    value: 'content-refresh',
    label: '目录刷新',
  }, {
    value: 'url-warm',
    label: 'URL预热',
  }];

  const operDatePick = {
    shortcuts: [{
      text: '最近三天',
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
        picker.$emit('pick', [start, end]);
      }
    }, {
      text: '最近一周',
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
        picker.$emit('pick', [start, end]);
      }
    }, {
      text: '最近一个月',
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
        picker.$emit('pick', [start, end]);
      }
    }],
    disabledDate: time => {
      return time.getTime() > Date.now() || time.getTime() < new Date(new Date().getTime() - 3600 * 1000 * 24 * 30)
    }
  };

  export default {
    name: "CdnRefresh",
    filters: {
      objectTypeFilter(objectType) {
        const objectTypeMap = {
          file: 'URL刷新',
          path: '目录刷新',
          preload: 'URL预热'
        };
        return objectTypeMap[objectType]
      },
      processFilter(process) {
        return parseInt(process.substring(0, process.length - 1));
      },
      statusFilter(status) {
        const statusMap = {
          Complete: 'success',
          Refreshing: 'warning',
          Failed: 'danger',
          Pending: 'default'
        };
        return statusMap[status]
      }
    },
    data() {
      return {
        listLoading: false,
        btnLoading: '',
        // oper
        tabActiveName: 'refresh',
        operOptions: operOptions,
        operSecondOptions: operOptions[0].second,
        operSecondActiveName: operOptions[0].second[0].value,
        operForm: {
          operateType: operOptions[0].value,
          refreshType: operOptions[0].second[0].value,
          content: ''
        },
        // oper list
        operTypeSearch: operTypeSearch,
        operDatePick: operDatePick,
        operDatePickMin: '',
        operDatePickMax: '',
        listQuery: {
          page: 1,
          limit: 20,
          url: undefined,
          operDate: [
            new Date(new Date().getTime() - 3600 * 1000 * 24 * 3),
            new Date()
          ],
          operType: 'all',
        },
        list: null,
      }
    },
    methods: {
      // 列表数据
      getList() {
        this.listLoading = true;
        fetchCdnRefreshList(this.listQuery).then(response => {
          this.list = response.data.items;
          this.total = response.data.total;
          this.listLoading = false;
          this.btnLoading = '';
        })
      },
      // 重置表单
      resetOperForm() {
        this.operForm = {
          operateType: operOptions[0].value,
          refreshType: operOptions[0].second[0].value,
          content: ''
        }
      },
      // 切换tab
      handleTabs(tab) {
        if (tab.label === 'OperateLog') {
          this.getList();
        }
      },
      // 表单提交
      handleSubmitOper() {
        this.btnLoading = 'submit';
        // 刷新
        createCdnRefresh(this.operForm).then(response => {
          this.$message({
            message: '操作成功',
            type: 'success'
          });
          setTimeout(() => {
            this.btnLoading = '';
            this.resetOperForm();
          }, 1000);
        })
      },
      // 切换操作类型
      handleOperType(value) {
        this.operForm.operateType = value;
        const arr = operOptions.filter((data) => {
          return data.value === value
        });
        this.operSecondOptions = arr[0].second;
        this.operSecondActiveName = arr[0].second[0].value
      },
      // 搜索
      handleFilter() {
        this.btnLoading = 'search';
        this.listQuery.page = 1;
        this.getList()
      },
      // 刷新task
      handleFreshTask(row) {
        this.listLoading = true;
        updateCdnRefreshTask(row.id).then(response => {
          let data = response.data;
          this.$message({
            message: '操作成功',
            type: 'success'
          });
          row.process = data.process;
          row.status = data.status;
          this.listLoading = false;
        })
      }
    }
  }
</script>

<style scoped>
  .refresh-tab {
    margin-top: 30px;
    width: 40%;
  }

</style>
