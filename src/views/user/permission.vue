<template>
  <div class="app-container">
    <el-tabs v-model="tabActiveName" @tab-click="handleTabs">

      <!--menu tab-->
      <el-tab-pane lazy :label="$t('table.user.permission.menu')" name="menu">
        <div class="filter-container">
          <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh"
                     @click="handleFresh('menu')">{{ $t('table.user.permission.refresh') }}
          </el-button>
        </div>
        <permission-table :refresh_count="refreshMenu" p_type="menu"/>
      </el-tab-pane>

      <!--api log-->
      <el-tab-pane lazy :label="$t('table.user.permission.api')" name="api">
        <div class="filter-container">
          <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh"
                     @click="handleFresh('api')">{{ $t('table.user.permission.refresh') }}
          </el-button>
        </div>
        <permission-table :refresh_count="refreshApi" p_type="api"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import PermissionTable from './components/PermissionTable'
  import { asyncRouterMap } from '@/router'
  import { syncApiPermission, syncMenuPermission } from '@/api/user'

  export default {
    name: "UserPermission",
    components: {
      PermissionTable
    },
    filters: {},
    data() {
      return {
        // oper
        tabActiveName: 'menu',
        refreshMenu: 0,
        refreshApi: 0,
      }
    },
    methods: {
      handleFresh(freshType) {
        const h = this.$createElement;
        const self = this;
        this.$msgbox({
          title: this.$t('message.confirmTitle'),
          type: 'warning',
          message: h('p', null, [
            h('span', null, '此操作将'),
            h('span', { style: 'color: red' }, '重置所有'),
            h('span', null, '当前类型权限，操作可能会持续5-10分钟，是否确认？'),
          ]),
          showCancelButton: true,
          confirmButtonText: this.$t('message.confirm'),
          cancelButtonText: this.$t('message.cancel'),
          beforeClose: (type, instance, done) => {
            if (type === 'confirm') {
              instance.confirmButtonLoading = true;
              instance.confirmButtonText = this.$t('message.doing');
              this.fresh(freshType).then(() => {
                this.$notify({
                  title: this.$t('message.success'),
                  message: this.$t('message.operSuccess'),
                  type: 'success',
                  duration: 2000
                });
                done();
                setTimeout(() => {
                  // 刷新界面
                  if (freshType === 'api') {
                    self.refreshApi++;
                  } else if (freshType === 'menu') {
                    self.refreshMenu++;
                  }
                  instance.confirmButtonLoading = false;
                  instance.confirmButtonText = this.$t('message.confirm');
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
      // 刷新操作
      fresh(freshType) {
        if (freshType === 'api') {
          return new Promise((resolve) => {
            syncApiPermission().then(response => {
              resolve()
            });
          });
        } else if (freshType === 'menu') {
          return new Promise((resolve) => {
            console.log(asyncRouterMap);
            let routeArr = this.filterSpecial(this.treeToArr(asyncRouterMap));
            syncMenuPermission(routeArr).then(response => {
              resolve()
            });
          });
        } else {
          return new Promise((reject) => {
            reject();
          })
        }
      },
      // route树形转arr数组
      treeToArr(routes, parentCode = '', parentName = '') {
        let routeArr = [];
        routes.forEach((r) => {
          if (r['hidden'] === undefined || r['hidden'] === false) {
            if (!r.children || r.children.length === 0) {
              // 无子节点
              let code = r['name'];
              let name = this.$t('route.' + r['meta']['title'], 'zh');
              routeArr.push({
                'parentCode': parentCode,
                'parentName': parentName,
                'code': code,
                'name': name,
              });
            } else if (r.children && r.children.length === 1) {
              // 只有一个子节点
              let code = r['name'] ? r['name'] : r.children[0]['name'];
              let temp = (r['meta'] !== undefined) ? r['meta']['title'] : r.children[0]['meta']['title'];
              let name = this.$t('route.' + temp, 'zh');
              routeArr.push({
                'parentCode': parentCode,
                'parentName': parentName,
                'code': code,
                'name': name,
              });
            } else {
              // 多个子节点
              let code = r['name'];
              let name = this.$t('route.' + r['meta']['title'], 'zh');
              routeArr.push({
                'parentCode': parentCode,
                'parentName': parentName,
                'code': code,
                'name': name,
              });
              routeArr = routeArr.concat(this.treeToArr(r.children, code, name));
            }
          }
        });
        return routeArr;
      },
      // filter过滤单独处理路由（资源-data）
      filterSpecial(routeArr) {
        let tempArr = routeArr.filter((r) => {
          return !(r.parentCode === 'Resource' && r.code !== 'ResourceUpload' && r.code !== 'ResourceCate')
        });
        tempArr.push({
          'parentCode': 'Resource',
          'parentName': this.$t('route.Resource', 'zh'),
          'code': 'ResourceData',
          'name': '资源数据',
        });
        return tempArr;
      },
      // 切换tab
      handleTabs(tab) {
        if (tab.label === 'OperateLog') {
          this.getList();
        }
      },
    }
  }
</script>
