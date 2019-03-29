<template>
  <div class="app-container">
    <div ref="loading">
      <map-chart-domains v-if="showChart" :chart-data="chartData"/>
      <h3>域名筛选</h3>
      <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
      <span style="margin-left: 8px;font-size: 0.7rem;color: gray;">（数据每60s更新一次，域名筛选将在下次刷新数据生效。）</span>
      <div style="margin: 15px 0;"></div>
      <el-checkbox-group v-model="checkedSpeeds" @change="handleCheckedChange">
        <el-checkbox v-for="s in speeds" :label="s" :key="s">{{s}}</el-checkbox>
      </el-checkbox-group>
      <div style="margin: 15px 0;"></div>
      <el-table
        v-loading="listLoading"
        ref="pointList"
        :key="tableKey"
        :data="endList"
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
            <div v-else>
              <el-tooltip placement="top">
                <div slot="content" v-html="scope.row.http_code_str"></div>
                <span v-if="scope.row.has_error" style="color:red;">
                  有非200状态
                </span>
                <span v-else style="color:rgb(36, 170, 29);">
                  200
                </span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.totalTime')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <div v-else>
              <el-tooltip placement="top">
                <div slot="content" v-html="scope.row.http_total_time_str"></div>
                <span
                  :style="scope.row.http_total_time | styleFilterSpeed">{{ scope.row.http_total_time || '-' }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.parseTime')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <div v-else>
              <el-tooltip placement="top">
                <div slot="content" v-html="scope.row.dns_resolve_time_str"></div>
                <span>{{ scope.row.dns_resolve_time || '-' }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.conTime')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <div v-else>
              <el-tooltip placement="top">
                <div slot="content" v-html="scope.row.http_conn_time_str"></div>
                <span>{{ scope.row.http_conn_time || '-' }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.downloadTime')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <div v-else>
              <el-tooltip placement="top">
                <div slot="content" v-html="scope.row.http_pre_trans_str"></div>
                <span>{{ scope.row.http_pre_trans || '-' }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.headTime')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <div v-else>
              <el-tooltip placement="top">
                <div slot="content" v-html="scope.row.http_start_trans_str"></div>
                <span>{{ scope.row.http_start_trans || '-' }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.downloadSize')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <div v-else>
              <el-tooltip placement="top">
                <div slot="content" v-html="scope.row.http_size_download_str"></div>
                <span>{{ scope.row.http_size_download || '-' }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.downloadSpeed')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <div v-else>
              <el-tooltip placement="top">
                <div slot="content" v-html="scope.row.http_speed_download_str"></div>
                <span>{{ scope.row.http_speed_download || '-' }}</span>
              </el-tooltip>
            </div>
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

  const speedOptions = ['>5000ms', '3000-5000ms', '2000-3000ms', '1000-2000ms', '400-1000ms', '<400ms'];

  export default {
    name: "SpeedMonitor",
    components: {
      MapChartDomains
    },
    filters: {
      styleFilterSpeed(val) {
        let speed = String(val).replace(' ms', '').replace(' kb', '').replace(' mb/s', '');
        if (speed < 400) {
          return "color:rgb(36, 170, 29);"
        } else if (speed >= 400 && speed < 1000) {
          return "color:rgb(66, 221, 63);"
        } else if (speed >= 1000 && speed < 2000) {
          return "color:rgb(190, 246, 99);"
        } else if (speed >= 2000 && speed < 3000) {
          return "color:rgb(246, 237, 68);"
        } else if (speed >= 3000 && speed < 5000) {
          return "color:rgb(246, 152, 51);"
        } else {
          return "color:red;"
        }
      },
    },
    data() {
      return {
        //checklist
        checkAll: false,
        checkedSpeeds: ['>5000ms', '3000-5000ms', '2000-3000ms', '1000-2000ms', '400-1000ms', '<400ms'],
        speeds: speedOptions,
        isIndeterminate: true,
        //
        tableKey: 0,
        url: '',
        fullLoading: null,
        listLoading: false,
        showChart: false,
        // domains
        total: 0,
        result: undefined,// 最终渲染结果
        list: undefined,
        endList: undefined,
        points: undefined,
        // websocket
        wsCode: undefined,
        wsWatch: undefined,
        // 表数据
        chartData: undefined,
        // timer
        timer: null
      }
    },
    watch: {},
    created() {
      this.init()
    },
    beforeDestroy() {
      clearTimeout(this.timer);
      this.timer = null;
    },
    methods: {
      // checklist
      handleCheckAllChange(val) {
        this.checkedSpeeds = val ? speedOptions : [];
        this.isIndeterminate = false;
      },
      handleCheckedChange(value) {
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.speeds.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.speeds.length;
      },
      handleFilterSpeed(v) {
        // 过滤筛选标签
        let time = this.trimUnit(v);
        let f1 = false, f2 = false, f3 = false, f4 = false, f5 = false, f6 = false;
        this.checkedSpeeds.forEach((c) => {
          switch (c) {
            case '>5000ms':
              f1 = time > 5000;
              break;
            case '3000-5000ms':
              f2 = time > 3000 && time < 5000;
              break;
            case '2000-3000ms':
              f3 = time > 2000 && time < 3000;
              break;
            case '1000-2000ms':
              f4 = time > 1000 && time < 2000;
              break;
            case '400-1000ms':
              f5 = time > 400 && time < 1000;
              break;
            case '<400ms':
              f6 = time < 400;
              break;
          }
        });
        return f1 || f2 || f3 || f4 || f5 || f6;
      },
      init() {
        this.$nextTick(() => {
          const self = this;
          this.fullLoading = this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            fullscreen: false,
            target: self.$refs['loading']
          });
        });
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
          if (tempList.length === 0 || data.points.length === 0) {
            this.endList = [];
            this.$message({
              showClose: true,
              message: '请先配置监控域名和监控点。',
              type: 'warning'
            });
            this.listLoading = false;
            return;
          }
          this.list = tempList;
          this.endList = tempList;
          this.total = tempList.length;
          this.wsCode = data.code;
          this.points = data.points;
          this.listLoading = false;
          this.handleMonitor();
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
            'count': 0,
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
              // 筛选数据
              if (this.handleFilterSpeed(d.http_total_time)) {
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
                totalData.count = totalData.count + 1;
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
                temp.http_size_download_str += '<br/> ' + d.location + ': ' + this.trimUnit(d.http_size_download) + ' kb';
                temp.http_speed_download_str += '<br/> ' + d.location + ': ' + this.trimUnit(d.http_speed_download) + ' mb/s';
                temp.http_start_trans_str += '<br/> ' + d.location + ': ' + this.trimUnit(d.http_start_trans) + ' ms';
                temp.http_total_time_str += '<br/> ' + d.location + ': ' + this.trimUnit(d.http_total_time) + ' ms';
                tempChartVal.data.push({
                  name: d.location,
                  value: this.trimUnit(d.http_total_time)
                })
              }
            });
            if (totalData.count > 0) {
              temp.has_error = totalData.has_error;
              temp.dns_resolve_time = (totalData.dns_resolve_time / length).toFixed(2) + ' ms';
              temp.http_conn_time = (totalData.http_conn_time / length).toFixed(2) + ' ms';
              temp.http_pre_trans = (totalData.http_pre_trans / length).toFixed(2) + ' ms';
              temp.http_size_download = (totalData.http_size_download / length).toFixed(2) + ' kb';
              temp.http_speed_download = (totalData.http_speed_download / length).toFixed(2) + ' mb/s';
              temp.http_start_trans = (totalData.http_start_trans / length).toFixed(2) + ' ms';
              temp.http_total_time = (totalData.http_total_time / length).toFixed(2) + ' ms';
              tempChartData.push(tempChartVal);
            }
          }
          if (totalData.count > 0) {
            temp.http_code_str = temp.http_code_str.substring(5);
            temp.dns_resolve_time_str = temp.dns_resolve_time_str.substring(5);
            temp.http_conn_time_str = temp.http_conn_time_str.substring(5);
            temp.http_pre_trans_str = temp.http_pre_trans_str.substring(5);
            temp.http_size_download_str = temp.http_size_download_str.substring(5);
            temp.http_speed_download_str = temp.http_speed_download_str.substring(5);
            temp.http_start_trans_str = temp.http_start_trans_str.substring(5);
            temp.http_total_time_str = temp.http_total_time_str.substring(5);
            tempList.push(temp);
          }
        });
        this.fullLoading.close();
        this.showChart = true;
        this.chartData = tempChartData;
        this.endList = tempList;
      },
      handleMonitor() {
        let self = this;
        self.$store.dispatch('sendWebSocket', { 'action': 'speed-monitor', 'code': self.wsCode });
        self.wsWatch = self.$store.watch((state, getters) => {
          return getters.wsMsg
        }, wsMsg => {
          if (wsMsg.action === 'speed-monitor') {
            self.wsMessage(wsMsg)
          }
        });
        this.timer = setInterval(function () {
          self.$store.dispatch('sendWebSocket', { 'action': 'speed-monitor', 'code': self.wsCode });
          self.wsWatch = self.$store.watch((state, getters) => {
            return getters.wsMsg
          }, wsMsg => {
            if (wsMsg.action === 'speed-monitor') {
              self.wsMessage(wsMsg)
            }
          })
        }, 30000);
      },
      // 接收消息
      wsMessage(data) {
        if (data.type === 'end') {
          this.$nextTick(() => {
            this.reset();
            this.wsWatch();
          })
        } else if (data.type === 'start') {
          for (const v of this.list) {
            v.data = [];
            v.http_code_str = '';
            v.dns_resolve_time_str = '';
            v.http_conn_time_str = '';
            v.http_pre_trans_str = '';
            v.http_size_download_str = '';
            v.http_speed_download_str = '';
            v.http_start_trans_str = '';
            v.http_total_time_str = '';
          }
        } else if (data.type === 'new') {
          // 节点正常
          if (data.result !== 'error') {
            // 每条包含多个域名数据
            let tempList = JSON.parse(data.result);
            for (const v of this.list) {
              let tempV = tempList.find((c) => {
                return c['url'].replace('http://', '').replace('https://', '') === v['path'].replace('http://', '').replace('https://', '')
              });
              if (tempV !== undefined) {
                let tempPoint = this.points.find((l) => {
                  return l['id'] === data.pointId
                });
                tempV['location'] = tempPoint['location'];
                v.loading = false;
                v.data.push(tempV);
              }
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
