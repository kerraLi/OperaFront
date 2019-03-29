<template>
  <div class="app-container">
    <div v-if="!hasResult" class="page-center">
      <div class="bullshit">
        <div class="bullshit__oops">{{ $t('route.DomainSpeedTest') }}</div>
        <div class="bullshit__input">
          <el-input :placeholder="$t('table.monitor.inputFindPath')"
                    v-model="url"
                    class="bullshit__input-put"
                    @keyup.enter.native="handleFindUrl">
            <template slot="prepend">http://</template>
          </el-input>
          <el-button class="bullshit__return-home" :loading="findLoading" @click="handleFindUrl">{{ $t('table.find') }}
          </el-button>
        </div>
      </div>
    </div>


    <div v-else>
      <div style="width: 50%;margin: 0 auto 40px auto;">
        <div class="bullshit">
          <div class="bullshit__oops">{{ $t('route.DomainSpeedTest') }}</div>
          <div class="bullshit__input">
            <el-input class="bullshit__input-put" v-model="url" :placeholder="$t('table.monitor.inputFindPath')"
                      @keyup.enter.native="handleFindUrl">
              <template slot="prepend">http://</template>
            </el-input>
            <el-button class="bullshit__return-home" :loading="findLoading" @click="handleFindUrl">
              {{ $t('table.find') }}
            </el-button>
          </div>
        </div>
      </div>
      <map-chart-domain v-if="showChart" :chart-data="chartData"/>
      <el-table
        v-loading="listLoading"
        ref="pointList"
        :key="tableKey"
        :data="list"
        :row-class-name="handleRowClass"
        border
        fit
        highlight-current-row
        style="width: 100%;">
        <el-table-column :label="$t('table.id')" prop="id" align="center" width="80" type="index">
          <template slot-scope="scope">
            <div v-if="scope.row.type==='average' && scope.$index===0">
              平均值：
            </div>
            <div v-else-if="average===undefined">
              {{ scope.$index+1 }}
            </div>
            <div v-else>
              {{ scope.$index }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.point')" min-width="80px">
          <template slot-scope="scope">
            <span v-if="!scope.row.loading && average !== undefined && scope.$index===0">
              共<span class="aveg-text">{{ total }}</span>个点
            </span>
            <span>{{ scope.row.location }}{{ scope.row.address }}{{ scope.row.operator }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.parseIP')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <span v-else-if="average !== undefined && scope.$index===0">
              共<span class="aveg-text">{{ scope.row.ip_num }}</span>个独立IP
            </span>
            <span v-else>{{ scope.row.ip || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.ipLocation')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <span v-else-if="average !== undefined && scope.$index===0">
              共<span class="aveg-text">{{ scope.row.node_num }}</span>个独立节点
            </span>
            <span v-else>{{ scope.row.ip_location || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.httpStatus')" min-width="150px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <span v-else-if="average !== undefined && scope.$index===0 && scope.row.has_error"
                  style="color: red;">
              有非200状态
            </span>
            <span v-else-if="average !== undefined && scope.$index===0 && !scope.row.has_error"
                  style="color:rgb(36, 170, 29);">
              200
            </span>
            <span v-else :style="scope.row.http_code | styleFilterCode">{{ scope.row.http_code || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.monitor.totalTime')" min-width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.loading"><i class="el-icon-loading"/></span>
            <span v-else
                  :style="scope.row.http_total_time | styleFilterSpeed">{{ scope.row.http_total_time || '-' }}</span>
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
  import { speedTest } from '@/api/monitor'
  import MapChartDomain from './components/MapChartDomain'

  export default {
    name: "SpeedTest",
    components: {
      MapChartDomain
    },
    filters: {
      styleFilterCode(val) {
        if (val === 200) {
          return "color:rgb(36, 170, 29);"
        } else {
          return "color:red;"
        }
      },
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
        tableKey: 0,
        url: '',
        findLoading: false,
        listLoading: false,
        showChart: false,
        hasResult: false,
        // 查询监测点列表
        total: 0,
        list: undefined,
        average: undefined,
        // websocket
        wsCode: undefined,
        wsWatch: undefined,
        // 表数据
        chartData: undefined
      }
    },
    methods: {
      handleFindUrl() {
        this.findLoading = true;
        this.listLoading = true;
        this.showChart = false;
        this.average = undefined;
        speedTest(this.url).then(response => {
          const data = response.data;
          this.list = data.points;
          this.total = data.points.length;
          this.wsCode = data.code;
          this.list.forEach((v) => {
            v.loading = true
          });
          this.handleMonitor();
          this.listLoading = false;
          // Just to simulate the time of the request
        });
        this.hasResult = true;
      },
      // 平均值行渲染
      handleRowClass({ row }) {
        if (row.type === 'average') {
          return 'info-row';
        }
      },
      handleMonitor() {
        this.$store.dispatch('sendWebSocket', { 'action': 'speed-test', 'code': this.wsCode });
        this.wsWatch = this.$store.watch((state, getters) => {
          return getters.wsMsg
        }, wsMsg => {
          if (wsMsg.action === 'speed-test') {
            this.wsMessage(wsMsg)
          }
        })
      },
      // 接收消息
      wsMessage(data) {
        if (data.type === 'end') {
          this.wsWatch();
          this.average = {
            'type': 'average',
            'loading': false,
            'ip_num': this.getCount('ip'),
            'node_num': this.getCount('ip_location'),
            'has_error': this.getErrorCount() > 0,
            'http_total_time': this.getAverage('http_total_time') + ' ms',
            'dns_resolve_time': this.getAverage('dns_resolve_time') + ' ms',
            'http_conn_time': this.getAverage('http_conn_time') + ' ms',
            'http_pre_trans': this.getAverage('http_pre_trans') + ' ms',
            'http_start_trans': this.getAverage('http_start_trans') + ' ms',
            'http_size_download': this.getAverage('http_size_download') + ' kb',
            'http_speed_download': this.getAverage('http_speed_download') + ' mb/s'
          };
          this.findLoading = false;
          // 平均值行
          this.$nextTick(() => {
            this.list.unshift(this.average)
            let tempList = [];
            this.list.forEach((c) => {
              if (c['type'] === 'normal') {
                tempList.push({
                  'name': c.location,
                  'value': c.http_total_time ? c.http_total_time.replace(' ms', '') : '-'
                })
              }
            });
            this.showChart = true;
            this.chartData = {
              'url': this.url,
              'list': tempList
            };
          })
        } else if (data.type === 'new') {
          let pointId = data.pointId;
          // 连接节点错误
          if (data.result === 'error') {
            for (const v of this.list) {
              if (v.id === pointId) {
                let temp = Object.assign({}, v);
                temp.loading = false;
                temp.type = 'error';
                temp.ip = '监控点未响应';
                const index = this.list.indexOf(v);
                this.list.splice(index, 1, temp);
                break
              }
            }
            return;
          }
          // ok
          for (const v of this.list) {
            if (v.id === pointId) {
              let temp = Object.assign({}, v, JSON.parse(data.result));
              if (temp['status'] !== 'success') {
                temp.type = 'error'
              } else {
                temp.type = 'normal';
              }
              temp.loading = false;
              const index = this.list.indexOf(v);
              this.list.splice(index, 1, temp);
              break
            }
          }
        }
      },
      // 平均值
      getAverage(field) {
        let sum = 0;
        let count = 0;
        for (let i = 0; i < this.list.length; ++i) {
          if (this.list[i][field] !== undefined) {
            let temp = this.list[i][field].replace(' ms', '').replace(' kb', '').replace(' mb/s', '');
            sum += parseFloat(temp);
            count++;
          }
        }
        return (sum / count).toFixed(2);
      },
      // 计数
      getCount(field) {
        let temp = [];
        for (let i = 0; i < this.list.length; ++i) {
          if (this.list[i][field] !== undefined) {
            if (temp.findIndex((c) => c === this.list[i][field]) < 0) {
              temp.push(this.list[i][field])
            }
          }
        }
        return temp.length;
      },
      // 非200计数
      getErrorCount() {
        let count = 0;
        for (let i = 0; i < this.list.length; ++i) {
          if (this.list[i]['http_code'] === undefined || parseInt(this.list[i]['http_code']) !== 200) {
            count++;
          }
        }
        return count;
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
