<template>
  <!-- 树级表格 -->
  <el-table
    v-loading="listLoading"
    :data="list"
    :row-style="showRow"
    border>
    <el-table-column :label="$t('table.user.permission.name')" :render-header="expandedHeaderRender">
      <template slot-scope="scope">
        <!--树级空格-->
        <span v-for="space in scope.row._level" :key="space" class="ms-tree-space"/>
        <!--展开/收起图标-->
        <span v-if="iconShow(scope.row)" class="tree-ctrl" @click="toggleExpanded(scope.$index)">
          <i v-if="!scope.row._expanded" class="el-icon-plus"/>
          <i v-else class="el-icon-minus"/>
        </span>
        <span class="link-type">{{ scope.row.name }}</span>
      </template>
    </el-table-column>
    <el-table-column :label="$t('table.user.permission.action')">
      <template slot-scope="scope">
        <span>{{ scope.row.action }}</span>
      </template>
    </el-table-column>
    <el-table-column :label="$t('table.user.permission.type')">
      <template slot-scope="scope">
        <el-tag :type="scope.row.type | typeFilter">{{ scope.row.type }}</el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
  import { getPermissionList } from '@/api/user'

  export default {
    name: "PermissionTable",
    props: {
      p_type: {
        type: String,
        required: true,
      },
    },
    filters: {
      typeFilter(type) {
        const typeMap = {
          menu: 'success',
          api: ''
        };
        return typeMap[type]
      }
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        listTree: null,
        listLoading: true,
      }
    },
    created() {
      this.getList()
    },
    beforeDestroy() {

    },
    methods: {
      getList() {
        this.listLoading = true;
        getPermissionList(this.p_type).then((response) => {
          let tempList = response.data;
          // 按照id正序排序
          tempList.sort((a, b) => {
            return a.id - b.id;
          });
          // 数据树形格式化(按照父子关系)
          let tmpTree = [];
          tempList.forEach((v) => {
            v.children = [];
            if (v.parentId === 0) {
              tmpTree.push(v);
            } else {
              let parent = tempList.find((c) => {
                return c.id === v.parentId;
              });
              parent.children.push(v);
            }
          });
          this.listTree = tmpTree;
          this.list = this.treeToArr(tmpTree);
          this.listLoading = false;
        });
      },
      // 数据排序格式化 ??普通赋值无效对比VUE赋值
      treeToArr(data, parent = null, level = null) {
        let tmp = [];
        Array.from(data).forEach((v) => {
          if (v._expanded === undefined) {
            this.$set(v, '_expanded', false);
          }
          let _level = 1;
          if (level !== undefined && level !== null) {
            _level = level + 1
          }
          this.$set(v, '_level', _level);
          if (parent) {
            this.$set(v, 'parent', parent);
          }
          tmp.push(v);
          if (v.children && v.children.length > 0) {
            tmp = tmp.concat(this.treeToArr(v.children, v, _level))
          }
        });
        return tmp;
      },
      // table-header
      expandedHeaderRender(h, { column }) {
        return (
          h('span', [
            h('span', {
              style: 'margin-right:5px;cursor:pointer;',
              on: {
                click: () => {
                  this.toggleExpandedAll(true)
                }
              }
            }, [
              h('svg-icon', {
                attrs: { 'icon-class': 'expandoff' }
              })
            ]),
            h('span', {
              style: 'margin-right:5px;cursor:pointer;',
              on: {
                click: () => {
                  this.toggleExpandedAll(false)
                }
              }
            }, [
              h('svg-icon', {
                attrs: { 'icon-class': 'expandon' }
              })
            ]),
            h('span', column.label)
          ])
        )
      },
      // table-行展示形式
      showRow: function (row) {
        const show = (row.row.parent ? (row.row.parent._expanded && row.row.parent._show) : true)
        row.row._show = show
        return show ? 'animation:treeTableShow 1s;-webkit-animation:treeTableShow 1s;' : 'display:none;'
      },
      // table-下级展开
      toggleExpanded: function (trIndex) {
        const record = this.list[trIndex]
        record._expanded = !record._expanded
      },
      toggleExpandedAll: function (b) {
        this.list.forEach((v) => {
          this.$set(v, '_expanded', b);
        })
      },
      // table-打开下一级 & 图标显示
      iconShow(record) {
        return (record.children && record.children.length > 0)
      }
    }
  }
</script>

<style rel="stylesheet/css">
  @keyframes treeTableShow {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @-webkit-keyframes treeTableShow {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>

<style lang="scss" rel="stylesheet/scss" scoped>
  $color-blue: #2196F3;
  $space-width: 18px;
  .ms-tree-space {
    position: relative;
    top: 1px;
    display: inline-block;
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    width: $space-width;
    height: 14px;

    &::before {
      content: ""
    }
  }

  .processContainer {
    width: 100%;
    height: 100%;
  }

  table td {
    line-height: 26px;
  }

  .tree-ctrl {
    position: relative;
    cursor: pointer;
    color: $color-blue;
    margin-left: -$space-width;
  }
</style>
