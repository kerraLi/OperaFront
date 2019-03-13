<template>
  <div class="dashboard-editor-container" v-loading="dashLoading">

    <github-corner style="position: absolute; top: 0px; border: 0; right: 0;"/>

    <panel-group :panel-num="panelNumbers" @handleSetLineChartData="handleSetLineChartData"/>

    <!--*****Account 各部分账号情况*****-->
    <el-row :gutter="8" v-if="showChart==='accounts'">
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}"
              style="margin-bottom:30px;">
        <box-card/>
      </el-col>
      <el-col :xs="{span: 36}" :sm="{span: 36}" :md="{span: 36}" :lg="{span: 18}" :xl="{span: 18}">
        <div class="chart-wrapper">
          <bar-chart :chart-data="accountChartData"/>
        </div>
      </el-col>
    </el-row>

    <!--<el-row :gutter="32" v-if="showChart==='accounts'">-->
    <!--<el-col v-for="pie in accountPieData" :xs="24" :sm="24" :lg="8">-->
    <!--<div class="chart-wrapper">-->
    <!--<pie-chart :pie-data="pie"/>-->
    <!--</div>-->
    <!--</el-col>-->
    <!--</el-row>-->

    <!--*****message 任务消息列表*****-->
    <el-row :gutter="8" v-if="showChart==='messages'">
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}"
              style="margin-bottom:30px;">
        <todo-list :todo-list="messageTodoData"/>
      </el-col>
      <el-col :xs="{span: 36}" :sm="{span: 36}" :md="{span: 36}" :lg="{span: 18}" :xl="{span: 18}"
              style="padding-right:8px;margin-bottom:30px;">
        <line-chart :chart-data="messageLineData"
                    style="background:#fff;padding:16px 16px 0;margin-bottom:32px;"/>
      </el-col>
    </el-row>

  </div>
</template>

<script>
  import GithubCorner from '@/components/GithubCorner'
  import PanelGroup from './components/PanelGroup'
  import LineChart from './components/LineChart'
  import RaddarChart from './components/RaddarChart'
  import PieChart from './components/PieChart'
  import BarChart from './components/BarChart'
  import TransactionTable from './components/TransactionTable'
  import TodoList from './components/TodoList'
  import BoxCard from './components/BoxCard'
  import { fetchNum, fetchMessage, fetchAccount } from '@/api/dash'


  const panelNumbers = {
    messages: 0,
    accounts: 0
  }

  const messagesLine = {
    dateData: [],
    aliMoney: [],
    aliExpired: [],
    godaddyExpired: [],
    webhookAlert: [],
  }

  const messagesTodo = []

  const accountChart = {}

  const accountResourceData = [];

  export default {
    name: 'DashboardAdmin',
    components: {
      GithubCorner,
      PanelGroup,
      LineChart,
      RaddarChart,
      PieChart,
      BarChart,
      TransactionTable,
      TodoList,
      BoxCard
    },
    data() {
      return {
        // loading
        dashLoading: true,
        // 默认显示模块
        showChart: 'accounts',
        // numbers
        panelNumbers: panelNumbers,
        // message line 数据
        messageLineData: messagesLine,
        // message to do 数据
        messageTodoData: messagesTodo,
        // account chart 数据
        accountChartData: accountChart,
        // account pie 数据
        accountPieData: accountResourceData
      }
    },
    created() {
      // this.refreshNum()
      // this.refreshAccounts()
      // this.refreshMessage()
    },
    methods: {
      refreshNum() {
        fetchNum().then(response => {
          this.panelNumbers = response.data;
        })
      },
      refreshMessage() {
        fetchMessage().then(response => {
          const data = response.data;
          this.messageLineData = data.lineChart;
          this.messageTodoData = data.todoList;
        })
      },
      refreshAccounts() {
        this.dashLoading = true
        fetchAccount().then(response => {
          const data = response.data;
          this.accountChartData = data.total;
          // this.accountPieData = data.divide;
          this.dashLoading = false;
        })
      },
      // 切换panel
      handleSetLineChartData(type) {
        this.showChart = type
        // switch (type) {
        //   case 'messages':
        //     this.messageLineData = messagesLine;
        //     this.messageTodoData = messagesTodo;
        //     break;
        //   case 'accounts':
        //     this.accountChartData = accountChart;
        //     this.accountPieData = accountResourceData;
        //     break;
        // }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
    min-height: 850px;

    .chart-wrapper {
      background: #fff;
      padding: 16px 16px 0;
      margin-bottom: 32px;
    }
  }
</style>
