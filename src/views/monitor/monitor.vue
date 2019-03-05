<template>
  <div class="app-container">
    <div>
      <map-chart-domains v-if="showChart" :chart-data="chartData"/>
      <el-table
        v-loading="listLoading"
        ref="pointList"
        :key="tableKey"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;">
        <el-table-column :label="$t('table.monitor.domain')" min-width="80px">
          <template slot-scope="scope">
            <span>{{ scope.row.path }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.httpStatus')" min-width="150px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <span v-else-if="scope.row.has_error">
              有非200状态
            </span>
            <span v-else-if="!scope.row.has_error">
              200
            </span>
            <span v-else>{{ scope.row.http_code || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.totalTime')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <div v-else>
              <el-tooltip placement="top">
                <div slot="content" v-html="scope.row.http_total_time_str"></div>
                <span>{{ scope.row.http_total_time || '-' }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.parseTime')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <span v-else>{{ scope.row.dns_resolve_time || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.conTime')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <span v-else>{{ scope.row.http_conn_time || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.downloadTime')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <span v-else>{{ scope.row.http_pre_trans || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.headTime')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <span v-else>{{ scope.row.http_start_trans || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.downloadSize')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <span v-else>{{ scope.row.http_size_download || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.downloadSpeed')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <span v-else>{{ scope.row.http_speed_download || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<style>
  .el-table .info-row {
    background: oldlace;
  }
</style>
<script>
  import { speedMonitor } from '@/api/monitor'
  import MapChartDomains from './components/MapChartDomains'

  export default {
    name: "SpeedMonitor",
    components: {
      MapChartDomains
    },
    data() {
      return {
        tableKey: 0,
        url: '',
        listLoading: false,
        showChart: false,
        // domains
        total: 0,
        result: undefined,// 最终渲染结果
        list: undefined,
        points: undefined,
        // websocket
        wsCode: undefined,
        wsWatch: undefined,
        // 表数据
        chartData: undefined
      }
    },
    watch: {},
    created() {
      this.init()
    },
    methods: {
      init() {
        this.listLoading = true;
        this.showChart = false;
        speedMonitor(this.url).then(response => {
          const data = response.data;
          let tempList = [];
          data.urls.forEach((v) => {
            let temp = {
              'path': v,
              'loading': true,
              'data': []
            };
            tempList.push(temp)
          });
          this.list = tempList;
          this.total = tempList.length;
          this.wsCode = data.code;
          this.points = data.points;
          this.handleMonitor();
          this.listLoading = false;
        });
      },
      // 重绘
      reset() {
        let tempList = [];
        let tempChartData = [];
        this.list.forEach((v) => {
          let temp = Object.assign({}, v);
          let tempChartVal = {
            'url': temp.path,
            'data': []
          };
          let totalData = {
            'has_error': 0,
            'dns_resolve_time': 0,
            'http_conn_time': 0,
            'http_pre_trans': 0,
            'http_size_download': 0,
            'http_speed_download': 0,
            'http_start_trans': 0,
            'http_total_time': 0
          };
          let length = temp.data.length;
          if (length > 0) {
            temp.data.forEach((d) => {
              temp.http_code_str = temp.http_code_str === undefined ? '' : temp.http_code_str;
              temp.dns_resolve_time_str = temp.dns_resolve_time_str === undefined ? '' : temp.dns_resolve_time_str;
              temp.http_conn_time_str = temp.http_conn_time_str === undefined ? '' : temp.http_conn_time_str;
              temp.http_pre_trans_str = temp.http_pre_trans_str === undefined ? '' : temp.http_pre_trans_str;
              temp.http_size_download_str = temp.http_size_download_str === undefined ? '' : temp.http_size_download_str;
              temp.http_speed_download_str = temp.http_speed_download_str === undefined ? '' : temp.http_speed_download_str;
              temp.http_start_trans_str = temp.http_start_trans_str === undefined ? '' : temp.http_start_trans_str;
              temp.http_total_time_str = temp.http_total_time_str === undefined ? '' : temp.http_total_time_str;
              if (d['http_code'] === undefined || parseInt(d['http_code']) !== 200) {
                totalData.has_error++;
              }
              totalData.dns_resolve_time += parseFloat(this.trimUnit(d.dns_resolve_time));
              totalData.http_conn_time += parseFloat(this.trimUnit(d.http_conn_time));
              totalData.http_pre_trans += parseFloat(this.trimUnit(d.http_pre_trans));
              totalData.http_size_download += parseFloat(this.trimUnit(d.http_size_download));
              totalData.http_speed_download += parseFloat(this.trimUnit(d.http_speed_download));
              totalData.http_start_trans += parseFloat(this.trimUnit(d.http_start_trans));
              totalData.http_total_time += parseFloat(this.trimUnit(d.http_total_time));
              temp.http_code_str += '<br/> ' + d.location + ': ' + this.trimUnit(d.http_code);
              temp.dns_resolve_time_str += '<br/> ' + d.location + ': ' + this.trimUnit(d.dns_resolve_time) + ' ms';
              temp.http_conn_time_str += '<br/> ' + d.location + ': ' + this.trimUnit(d.http_conn_time) + ' ms';
              temp.http_pre_trans_str += '<br/> ' + d.location + ': ' + this.trimUnit(d.http_pre_trans) + ' ms';
              temp.http_size_download_str += '<br/> ' + d.location + ': ' + this.trimUnit(d.http_size_download) + ' ms';
              temp.http_speed_download_str += '<br/> ' + d.location + ': ' + this.trimUnit(d.http_speed_download) + ' ms';
              temp.http_start_trans_str += '<br/> ' + d.location + ': ' + this.trimUnit(d.http_start_trans) + ' ms';
              temp.http_total_time_str += '<br/> ' + d.location + ': ' + this.trimUnit(d.http_total_time) + ' ms';
              tempChartVal.data.push({
                name: d.location,
                value: this.trimUnit(d.http_total_time)
              })
            });
            temp.dns_resolve_time = (totalData.dns_resolve_time / length).toFixed(2) + ' ms';
            temp.http_conn_time = (totalData.http_conn_time / length).toFixed(2) + ' ms';
            temp.http_pre_trans = (totalData.http_pre_trans / length).toFixed(2) + ' ms';
            temp.http_size_download = (totalData.http_size_download / length).toFixed(2) + ' kb';
            temp.http_speed_download = (totalData.http_speed_download / length).toFixed(2) + ' mb/s';
            temp.http_start_trans = (totalData.http_start_trans / length).toFixed(2) + ' ms';
            temp.http_total_time = (totalData.http_total_time / length).toFixed(2) + ' ms';
            tempChartData.push(tempChartVal);
          }
          temp.http_code_str = temp.http_code_str.substring(5);
          temp.dns_resolve_time_str = temp.dns_resolve_time_str.substring(5);
          temp.http_conn_time_str = temp.http_conn_time_str.substring(5);
          temp.http_pre_trans_str = temp.http_pre_trans_str.substring(5);
          temp.http_size_download_str = temp.http_size_download_str.substring(5);
          temp.http_speed_download_str = temp.http_speed_download_str.substring(5);
          temp.http_start_trans_str = temp.http_start_trans_str.substring(5);
          temp.http_total_time_str = temp.http_total_time_str.substring(5);
          tempList.push(temp);
        });
        this.showChart = true;
        this.chartData = tempChartData;
        this.list = tempList;
        console.log('rrrrrrrrrrrr', this.list)
      },
      handleMonitor() {
        this.$store.dispatch('sendWebSocket', { 'action': 'speed-monitor', 'code': this.wsCode });
        this.wsWatch = this.$store.watch((state, getters) => {
          return getters.wsMsg
        }, wsMsg => {
          if (wsMsg.action === 'speed-monitor') {
            this.wsMessage(wsMsg)
          }
        })
      },
      // 接收消息
      wsMessage(data) {
        if (data.type === 'end') {
          this.reset();
          this.wsWatch();
        } else if (data.type === 'new') {
          // 节点正常
          if (data.result !== 'error') {
            // 每条包含多个域名数据
            let tempList = JSON.parse(data.result)['list'];
            for (const v of this.list) {
              let tempV = tempList.find((c) => {
                return c['url'] === v['path']
              });
              let tempPoint = this.points.find((l) => {
                return l['id'] === data.pointId
              });
              tempV['location'] = tempPoint['location'];
              v.loading = false;
              v.data.push(tempV);
            }
          }
        }
      },
      trimUnit(val) {
        return String(val).replace(' ms', '').replace(' kb', '').replace(' mb/s', '')
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .aveg-text {
    font-size: 22px;
    padding: 0 2px 0 2px;
    color: #009933;
  }

  .page-center {
    width: 40%;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .bullshit {
    width: 100%;
    position: relative;
    overflow: hidden;

    &__oops {
      text-align: center;
      font-size: 62px;
      font-weight: bold;
      line-height: 70px;
      color: #1482f0;
      opacity: 0;
      margin-bottom: 40px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-fill-mode: forwards;
    }

    &__input {
      width: 100%;
      float: left;
    }

    &__input-put {
      width: 80%;
    }

    &__return-home {
      border: none;
      display: block;
      float: right;
      width: 110px;
      height: 36px;
      background: #1482f0;
      border-radius: 100px;
      text-align: center;
      color: #ffffff;
      opacity: 0;
      font-size: 14px;
      cursor: pointer;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.3s;
      animation-fill-mode: forwards;
    }

    @keyframes slideUp {
      0% {
        transform: translateY(60px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }

  }
</style>
