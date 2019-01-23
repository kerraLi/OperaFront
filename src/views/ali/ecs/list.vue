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
        {{ $t('table.expiring') }}
      </el-checkbox>
      <el-checkbox v-model="listQuery.ifMarked" class="filter-item" style="margin-left:15px;margin-right: 15px;">
        {{ $t('table.deprecatedData') }}
      </el-checkbox>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search"
                 :loading="btnLoading === 'search'"
                 @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-check"
                 :loading="btnLoading === 'allDeprecated'"
                 @click="handleModifyMarkedAll(true)">
        {{ $t('table.allDeprecated') }}
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-close"
                 :loading="btnLoading === 'allNoDeprecated'"
                 @click="handleModifyMarkedAll(false)">
        {{ $t('table.allNoDeprecated') }}
      </el-button>
      <span style="margin-left: 8px;font-size: 0.7rem;color: gray;">{{ $t('table.deprecatedMessage') }}</span>
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
      <el-table-column :label="$t('table.ali.username')" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.ali.ecs.createdTime')" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.creationTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.ali.ecs.expiredTime')" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.expiredTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <el-tag type="danger" v-if="scope.row.alertExpired">{{ $t('table.expiring') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.ali.ecs.hostName')" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.hostName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.ali.ecs.instance')" min-width="150px">
        <template slot-scope="scope">
          <p>{{ scope.row.instanceId }}</p>
          <p>{{ scope.row.instanceName }}</p>
          <el-tag type="danger" v-if="scope.row.alertMarked">{{ $t('table.deprecatedData') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.ali.ecs.publicIps')" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.publicIps }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.ali.ecs.regionId')" min-width="150px">
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
      <el-table-column :label="$t('table.actions')" align="center" width="120"
                       class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-dropdown>
            <el-button size="mini" type="primary" style="width: 82px">
              {{ $t('table.actions') }}<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="filterAction(scope.row,'deprecated')"
                                @click.native="handleModifyMarked(scope.row,true)">
                {{ $t('table.deprecated') }}
              </el-dropdown-item>
              <el-dropdown-item v-if="filterAction(scope.row,'unDeprecated')"
                                @click.native="handleModifyMarked(scope.row,false)">
                {{ $t('table.unDeprecated') }}
              </el-dropdown-item>
              <el-dropdown-item v-if="filterAction(scope.row,'run')"
                                :divided="filterAction(scope.row,'run')"
                                @click.native="handleStatus(scope.row,'run')">
                {{ $t('table.ali.ecs.run') }}
              </el-dropdown-item>
              <el-dropdown-item v-if="filterAction(scope.row,'rerun')"
                                :divided="filterAction(scope.row,'rerun')"
                                @click.native="handleStatus(scope.row,'rerun')">
                {{ $t('table.ali.ecs.rerun') }}
              </el-dropdown-item>
              <el-dropdown-item v-if="filterAction(scope.row,'stop')"
                                @click.native="handleStatus(scope.row,'stop')">
                {{ $t('table.ali.ecs.stop') }}
              </el-dropdown-item>
              <el-dropdown-item v-if="filterAction(scope.row,'free')"
                                @click.native="handleStatus(scope.row,'free')">
                {{ $t('table.ali.ecs.free') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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
  import { fetchEcsList, actionEcsStatus } from '@/api/ali'
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
        };
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
        // 提交操作ecs数据
        actionEcs: {
          id: undefined,
          action: undefined,
          ifForce: false
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
              message: this.$t('message.operSuccess'),
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
              message: this.$t('message.operSuccess'),
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
              message: this.$t('message.operSuccess'),
              type: 'success'
            });
            this.getList()
          })
        } else {
          this.btnLoading = 'allNoDeprecated';
          unmarkAll('ali', 'ecs', ids).then(response => {
            this.$message({
              message: this.$t('message.operSuccess'),
              type: 'success'
            });
            this.getList()
          })
        }
      },
      // 启动 & 重启 & 停止 & 释放
      handleStatus(row, action) {
        if (!this.filterAction(row, action))
          return;
        this.actionEcs = {
          id: row.id,
          action: action,
          ifForce: false
        };
        const h = this.$createElement;
        let forceMsg = '';
        if (action === 'stop' || action === 'rerun' || action === 'free') {
          forceMsg = h('div', {
            style: {
              'margin-top': '10px'
            }
          }, [
            h('input', {
              style: {
                'vertical-align': 'middle',
                'cursor': 'pointer'
              },
              attrs: {
                type: 'checkbox',
              },
              domProps: {
                checked: this.actionEcs.ifForce
              },
              on: {
                input: function (event) {
                  this.actionEcs.ifForce = event.target.checked;
                }.bind(this)
              }
            }),
            h('span', {
              style: {
                'vertical-align': 'middle',
                'margin-left': '5px'
              },
            }, this.$t('table.ali.ecs.ifForce')),
            h('p', {
              style: {
                'font-size': '11px',
                'color': 'red'
              }
            }, this.$t('table.ali.ecs.forceTip'))
          ]);
        }
        this.$msgbox({
          title: this.$t('message.confirmTitle'),
          type: 'warning',
          message: h('p', null, [
            h('span', null, this.$t('table.ali.ecs.actionConfirmT1')),
            h('span', { style: 'color: red' }, this.$t('table.ali.ecs.' + action)),
            h('span', null, this.$t('table.ali.ecs.actionConfirmT2')),
            forceMsg
          ]),
          showCancelButton: true,
          confirmButtonText: this.$t('message.confirm'),
          cancelButtonText: this.$t('message.cancel'),
          beforeClose: (type, instance, done) => {
            if (type === 'confirm') {
              instance.confirmButtonLoading = true;
              instance.confirmButtonText = this.$t('message.doing');
              let actAction = action;
              if (this.actionEcs.ifForce) {
                actAction = actAction + '-force';
              }
              actionEcsStatus(row.id, actAction).then(response => {
                switch (action) {
                  case 'run':
                    row.status = 'Starting';
                    break;
                  case 'rerun':
                    row.status = 'Starting';
                    break;
                  case 'stop':
                    row.status = 'Stopping';
                    break;
                  case 'free':
                    const index = this.list.indexOf(row);
                    this.list.splice(index, 1);
                    break;
                  default:
                    break;
                }
                this.$message({
                  message: this.$t('message.operSuccess'),
                  type: 'success'
                });
                done();
                setTimeout(() => {
                  instance.confirmButtonLoading = false;
                }, 300);
              }).catch(() => {
                instance.confirmButtonLoading = false;
                instance.confirmButtonText = this.$t('message.confirm');
              })
            } else {
              done();
            }
          }
        }).catch(() => {
        });
      },
      // 搜索
      handleFilter() {
        this.btnLoading = 'search';
        this.listQuery.page = 1;
        this.getList()
      },
      // 操作 显示渲染
      filterAction(row, action) {
        switch (action) {
          case 'deprecated':
            return !row.alertMarked;
          case 'unDeprecated':
            return row.alertMarked;
          case 'run':
            return row.status === 'Stopped';
          case 'rerun':
            return row.status === 'Running';
          case 'stop':
            return row.status === 'Running';
          case 'free':
            return true;
          default:
            return false;
        }
      },
    }
  }
</script>
