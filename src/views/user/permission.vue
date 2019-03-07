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
        <permission-table p_type="menu"/>
      </el-tab-pane>

      <!--api log-->
      <el-tab-pane lazy :label="$t('table.user.permission.api')" name="api">
        <div class="filter-container">
          <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh"
                     @click="handleFresh('api')">{{ $t('table.user.permission.refresh') }}
          </el-button>
        </div>
        <permission-table p_type="api"/>
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
      }
    },
    methods: {
      handleFresh(freshType) {
        const h = this.$createElement;
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
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = this.$t('message.doing');
            this.fresh(freshType).then(() => {
              this.$notify({
                title: this.$t('message.success'),
                message: this.$t('message.operSuccess'),
                type: 'success',
                duration: 2000
              })
            });
            done();
            done();
            setTimeout(() => {
              instance.confirmButtonLoading = false;
              instance.confirmButtonText = this.$t('message.confirm');
            }, 300);
          }
        }).catch(() => {
        });
      },
      fresh(freshType) {
        if (freshType === 'api') {
          return new Promise((resolve) => {
            syncApiPermission().then(response => {
              resolve()
            });
          });
        } else if (freshType === 'menu') {
          return new Promise((resolve) => {
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
      treeToArr(routes, parentCode = '', parentPath = '') {
        let routeArr = [];
        routes.forEach((r) => {
          if (r['hidden'] === undefined || r['hidden'] === false) {
            if (!r.children || r.children.length === 0) {
              let code = r['name'] ? r['name'] : r['meta']['title'];
              routeArr.push({
                'parentCode': parentCode,
                'parentName': parentCode ? this.$t('route.' + parentCode, 'zh') : '',
                'code': code,
                'name': this.$t('route.' + code, 'zh'),
                'path': parentPath ? (parentPath + '/' + r['path']) : r['path']
              });
            } else if (r.children && r.children.length === 1) {
              let code = r['name'] ? r['name']
                : (r['meta'] && r['meta']['title'] ? r['meta']['title']
                  : (r.children[0]['name'] ? r.children[0]['name']
                    : r.children[0]['meta']['title']));
              routeArr.push({
                'parentCode': parentCode,
                'parentName': parentCode ? this.$t('route.' + parentCode, 'zh') : '',
                'code': code,
                'name': this.$t('route.' + code, 'zh'),
                'path': parentPath ? (parentPath + '/' + r['path'] + '/' + r.children[0]['path']) : (r['path'] + '/' + r.children[0]['path'])
              });
            } else {
              let code = r['name'] ? r['name'] : r['meta']['title'];
              routeArr.push({
                'parentCode': parentCode,
                'parentName': parentCode ? this.$t('route.' + parentCode, 'zh') : '',
                'code': code,
                'name': this.$t('route.' + code, 'zh'),
                'path': parentPath ? (parentPath + '/' + r['path']) : r['path']
              });
              routeArr = routeArr.concat(this.treeToArr(r.children, code, (parentPath ? (parentPath + '/' + r['path']) : r['path'])));
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
          'path': '/resource/{data}'
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
