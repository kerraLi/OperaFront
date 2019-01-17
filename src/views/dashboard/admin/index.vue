<template>
  <div class="dashboard-editor-container">

    <github-corner style="position: absolute; top: 0px; border: 0; right: 0;"/>

    <panel-group :panel-num="panelNumbers" @handleSetLineChartData="handleSetLineChartData"/>

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


    <el-row :gutter="32" v-if="showChart==='accounts'">
      <el-col v-for="pie in accountPieData.ali" :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart :pie-data="pie"/>
        </div>
      </el-col>
      <el-col v-for="pie in accountPieData.go" :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart :pie-data="pie"/>
        </div>
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

  const panelNumbers = {
    messages: 8888,
    accounts: 6666
  }

  const messagesLine = {
    dateData: ['01/11', '01/12', '01/13', '01/14', '01/15', '01/16', '01/17'],
    aliMoney: [100, 120, 161, 134, 105, 160, 165],
    aliExpired: [120, 82, 91, 154, 162, 140, 145],
    godaddyExpired: [30, 75, 121, 154, 15, 16, 5],
    webhookAlert: [2, 5, 7, 9, 3, 3, 34],
  }

  const messagesTodo = [
    { themeId: 'star this repository', status: 'new' },
    { themeId: 'fork this repository', status: 'new' },
    { themeId: 'webpack', status: 'new' },
    { themeId: 'follow author', status: 'active' },
    { themeId: 'vue-element-admin', status: 'active' },
    { themeId: 'vue', status: 'finish' },
    { themeId: 'element-ui', status: 'finish' },
    { themeId: 'axios', status: 'finish' },
  ]

  const accountChart = {
    xData: ['Ali-ECS', 'Ali-CDN域名', 'GO-域名', 'GO-证书'],
    normal: [79, 52, 200, 334],
    invalid: [80, 52, 200, 334],
    expired: [334, 390, 330, 220],
    deprecated: [30, 52, 200, 334],
  }

  const accountResourceData = {
    ali: [
      {
        type: 'ali',
        username: 'test1',
        theme:'ecs',
        normal: 30,
        invalid: 50,
        expired: 523,
        deprecated: 123,
      }, {
        type: 'ali',
        username: 'ali3',
        theme:'ecs',
        normal: 30,
        invalid: 50,
        expired: 124,
        deprecated: 123,
      }, {
        type: 'ali',
        username: 'ali4',
        theme:'cdn',
        normal: 30,
        invalid: 50,
        expired: 100,
        deprecated: 123,
      }, {
        type: 'ali',
        username: 'ali5',
        theme:'cdn',
        normal: 30,
        invalid: 50,
        expired: 3,
        deprecated: 12,
      }
    ],
    go: [
      {
        type: 'go',
        username: 'go1',
        theme:'domain',
        normal: 30,
        invalid: 50,
        expired: 100,
        deprecated: 123,
      }, {
        type: 'go',
        username: 'go1222',
        theme:'domain',
        normal: 30,
        invalid: 50,
        expired: 6,
        deprecated: 123,
      }, {
        type: 'go',
        username: 'go12223333',
        theme:'domain',
        normal: 30,
        invalid: 50,
        expired: 43,
        deprecated: 123,
      }, {
        type: 'go',
        username: 'go444',
        theme:'domain',
        normal: 30,
        invalid: 50,
        expired: 5,
        deprecated: 123,
      }
    ],
  };

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
        // 默认显示模块
        showChart: 'messages',
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
    methods: {
      // 切换panel
      handleSetLineChartData(type) {
        this.showChart = type
        switch (type) {
          case 'messages':
            this.messageLineData = messagesLine;
            this.messageTodoData = messagesTodo;
            break;
          case 'accounts':
            this.accountChartData = accountChart;
            this.accountPieData = accountResourceData;
            break;
        }
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
