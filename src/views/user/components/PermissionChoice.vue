<template>
  <div>
    <sticky class-name="sub-sticky" :zIndex="3">
      <el-tooltip placement="top" content="返回上级" style="cursor: pointer;font-size: 2rem;text-align: right;">
        <span @click="handleBack">
          <i class="el-icon-d-arrow-left"></i>
        </span>
      </el-tooltip>
      <span style="padding-left: 10px;font-size: small;">
        当前角色 <span style="color: #409EFF;font-size:large;">{{ role.name }}</span> ,
        共 <span style="color: #409EFF;font-size:large;">{{ listTotal }}</span> 条权限,
        已选择 <span style="color: #409EFF;font-size: large;">{{ checkCount }}</span> 条权限.
      </span>
      <el-button size="mini" type="success" icon="el-icon-edit-outline"
                 @click="handleSave">
        {{ $t('table.save') }}
      </el-button>
    </sticky>
    <div class="app-container">
      <!-- 树级表格 -->
      <el-table
        ref="choiceTable"
        v-loading="listLoading"
        :data="list"
        :row-style="showRow"
        size="mini"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleChecked"
        border>
        <el-table-column
          type="selection"
          width="40"
        >
        </el-table-column>
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

      <el-tooltip placement="top" content="Top">
        <back-to-top :custom-style="myBackToTopStyle" :visibility-height="300" :back-position="50"
                     transition-name="fade"/>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
  import { getPermissionList, getRolePermissions, saveRolePermissions } from '@/api/user'
  import Sticky from '@/components/Sticky'
  import BackToTop from '@/components/BackToTop'

  export default {
    name: "PermissionTable",
    components: {
      Sticky,
      BackToTop
    },
    props: {
      p_type: {
        type: String,
        default: ''
      },
      role: {
        type: Object,
        required: true
      }
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
        listTotal: 0,
        listTree: null,
        listLoading: true,
        // 标记是否改动过数据
        hasChange: false,
        //
        checkList: [],
        checkCount: 0,
        // back to top
        myBackToTopStyle: {
          right: '50px',
          bottom: '50px',
          width: '40px',
          height: '40px',
          'border-radius': '4px',
          'line-height': '45px', // 请保持与高度一致以垂直居中 Please keep consistent with height to center vertically
          background: '#e7eaf1'// 按钮的背景颜色 The background color of the button
        }
      }
    },
    created() {
      this.getList()
    },
    beforeDestroy() {

    },
    methods: {
      // 返回上级
      handleBack() {
        if (this.hasChange) {
          const self = this;
          const h = this.$createElement;
          this.$msgbox({
            title: this.$t('message.confirmTitle'),
            type: 'warning',
            message: h('p', null, [
              h('span', null, '离开将失去当前已修改权限，是否确认？'),
            ]),
            showCancelButton: true,
            confirmButtonText: this.$t('message.confirm'),
            cancelButtonText: this.$t('message.cancel'),
            beforeClose: (type, instance, done) => {
              if (type === 'confirm') {
                // 通知外界关闭事件
                self.$emit('closePer');
                done();
              } else {
                done();
              }
            }
          }).catch(() => {
          });
        } else {
          this.$emit('closePer');
        }
      },
      // 保存
      handleSave() {
        const ids = this.checkList.map((c) => {
          return c.id;
        });
        saveRolePermissions(this.role.id, ids).then((response) => {
          this.$notify({
            title: this.$t('message.success'),
            message: this.$t('message.operSuccess'),
            type: 'success',
            duration: 2000
          });
          this.hasChange = false;
          this.getList();
        })
      },
      // 选择操作
      handleSelect(vals, record) {
        this.hasChange = true;
        this.handleSelectChildren(record);
      },
      handleSelectAll(vals) {
        this.hasChange = true;
      },
      // 操作其儿子
      handleSelectChildren(record) {
        if (record.children && record.children.length > 0) {
          record.children.forEach(row => {
            this.$refs.choiceTable.toggleRowSelection(row);
            this.handleSelectChildren(row);
          });
        }
      },
      // 多选
      handleChecked(vals) {
        this.checkList = vals;
        this.checkCount = vals.length;
      },
      getList() {
        this.listLoading = true;
        // 获取所有权限
        getPermissionList(this.p_type).then((response) => {
          let tempList = response.data;
          // 获取当前角色权限
          getRolePermissions(this.role.id).then((r) => {
            let selectIds = r.data.map((c) => {
              return c.id;
            });
            // 按照id正序排序
            tempList.sort((a, b) => {
              return a.id - b.id;
            });
            // 数据树形格式化(按照父子关系)
            let tmpTree = [];
            tempList.forEach((v) => {
              v._select = selectIds.findIndex((c) => {
                return c === v.id
              }) >= 0;
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
            this.listTotal = this.list.length;
            this.listLoading = false;
            // 初始化多选框
            this.$nextTick(() => {
              this.$refs.choiceTable.clearSelection();
              this.list.forEach((v) => {
                this.$refs.choiceTable.toggleRowSelection(v, v._select);
              });
            })
          });
        });
      },
      // 数据排序格式化 ??普通赋值无效对比VUE赋值
      treeToArr(data, parent = null, level = null) {
        let tmp = [];
        Array.from(data).forEach((v) => {
          if (v._expanded === undefined) {
            this.$set(v, '_expanded', false);
          }
          if (v._select === undefined) {
            this.$set(v, '_select', false);
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
