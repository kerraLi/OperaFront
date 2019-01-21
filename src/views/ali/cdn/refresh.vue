<template>
  <div class="app-container">
    <el-tabs v-model="tabActiveName">

      <!--fresh tab-->
      <el-tab-pane class="refresh-tab" :label="$t('table.refreshCache')" name="refresh">
        <el-form ref="form" :model="operForm" label-width="100px">
          <el-form-item :label="$t('table.operType')">
            <el-select v-model="operForm.operateType" @change="handleOper" placeholder="请选择操作类型">
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
              placeholder=""
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
          <el-table-column :label="$t('table.id')" prop="id" align="center" width="65" type="index"/>
          <el-table-column :label="$t('table.operContent')" min-width="60px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.userName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.operType')" width="150px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.gmtCreated | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.operTime')" width="150px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.gmtModified | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.status')" min-width="100px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.domainName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.progress')" min-width="150px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.cname }}</span>
            </template>
          </el-table-column>
        </el-table>

      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import { createCdnRefresh, fetchCdnRefreshList } from '@/api/ali'

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
          }, 1000);
        })
      },
      handleOper(value) {
        this.operActiveName = value;
        const arr = operOptions.filter((data) => {
          return data.value === value
        });
        this.operSecondOptions = arr[0].second;
        this.operSecondActiveName = arr[0].second[0].value
      },
      handleFilter() {
        this.btnLoading = 'search';
        this.listLoading = true;
        // 刷新
        createCdnRefresh(this.operForm).then(response => {
          this.$message({
            message: '操作成功',
            type: 'success'
          });
          setTimeout(() => {
            this.btnLoading = '';
          }, 1000);
        })
      },
    }
  }
</script>

<style scoped>
  .refresh-tab {
    margin-top: 30px;
    width: 40%;
  }

</style>
