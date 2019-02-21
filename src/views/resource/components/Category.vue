<template>
  <div class="category">
    <!-- 添加新的分类 -->
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
                 @click="handleCreate">{{ $t('table.add') }}
      </el-button>
    </div>

    <!-- 树级表格 -->
    <el-table :data="list"
              :row-style="showRow"
              v-loading="listLoading"
              border>
      <el-table-column :label="$t('table.resource.pathName')">
        <template slot-scope="scope">
          <!--树级空格-->
          <span v-for="space in scope.row._level" :key="space" class="ms-tree-space"/>
          <!--展开/收起图标-->
          <span v-if="iconShow(scope.row)" class="tree-ctrl" @click="toggleExpanded(scope.$index)">
            <i v-if="!scope.row._expanded" class="el-icon-plus"/>
            <i v-else class="el-icon-minus"/>
          </span>
          <span class="link-type">{{ scope.row.pathName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.path')">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.resource.type')">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type | typeFilter">{{ scope.row.type }}</el-tag>
          <span>{{ typeNameComputed(scope.row.type) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="handleCreateRow(scope.row)">{{ $t('table.add') }}</el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button size="mini" type="danger"
                     :loading="btnLoading === 'delete-'+ scope.row.id"
                     @click="handleDelete(scope.row)">{{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>


    <!-- 新增分类对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <div style="height: auto;overflow: hidden;">
        <div style="float: left;">
          <el-tree
            ref="tree"
            :data="listTree"
            :props="dialogTreeProps"
            :expand-on-click-node="dialogExpand"
            v-if="listTree && listTree.length>0"
            show-checkbox
            default-expand-all
            node-key="id"
            highlight-current
            check-strictly
            @check-change="onCheckCate"/>
        </div>
        <div style="float: left;margin-left: 50px;width: auto;">
          <el-form ref="dataForm" :model="temp" :rules="dialogRules" label-position="left" label-width="80px">
            <el-form-item required :label="$t('table.resource.type')" prop="type">
              <el-select v-model="temp.type" class="filter-item" style="width: 150px">
                <el-option v-for="item in this.dialogTypeSelection" :key="item.code"
                           :label="item.name" :value="item.code"/>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('table.resource.parentNode')" prop="parentName">
              <el-input v-model="temp.parentName"
                        placeholder="请选择父分类;若不选择;创建为根类."
                        readonly
                        disabled
                        style="width: 300px;"/>
            </el-form-item>
            <el-form-item :label="$t('table.resource.path')" prop="path">
              <el-input v-model="temp.path" style="width: 300px;"/>
            </el-form-item>
            <el-form-item :label="$t('table.resource.pathName')" prop="pathName">
              <el-input v-model="temp.pathName" style="width: 300px;"/>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button :loading="loading" type="primary" @click="saveData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { fetchTypeList, fetchCateList, saveCate, removeCate } from '@/api/resource'
  import waves from '@/directive/waves'

  const typeSelection = [
    {
      code: 'menu',
      name: '目录',
    }
  ];

  const checkAlpha = (rule, value, callback) => {
    if (value.length < 0 || value.length > 6) {
      callback(new Error('分类编码在0至6个字符之间'))
    } else {
      let reg = /^[a-z]+$/;
      if (!reg.test(value)) {
        callback(new Error('分类编码必须为小写英文字母组成'))
      }
      callback()
    }
  };

  export default {
    name: "ResourceCate",
    directives: { waves },
    filters: {
      typeFilter(type) {
        const typeMap = {
          menu: 'success'
        };
        return typeMap[type]
      }
    },
    data() {
      return {
        btnLoading: '',
        loading: false,
        listLoading: false,
        list: null,
        listTree: null,
        // 编辑框
        temp: {
          id: undefined,
          // 父分类
          parentId: 0,
          parentName: '',
          path: '',
          pathName: '',
          type: 'menu'// 该类别类型（menu/等）
        },
        dialogTypeSelection: typeSelection,
        dialogTreeProps: {
          children: 'children',
          label: 'pathName',
          disabled: this.disableTree
        },
        dialogExpand: false,
        dialogTreeSelect: [],
        dialogStatus: '',
        dialogFormVisible: false,
        dialogRules: {
          path: [{ required: true, message: 'path is required', trigger: 'change' },
            {
              validator: checkAlpha,
              trigger: 'change'
            }],
          pathName: [{ required: true, message: 'pathName is required', trigger: 'change' }],
        },
        textMap: {
          update: this.$t('table.resource.updateCate'),
          create: this.$t('table.resource.createCate'),
        },
      }
    },
    created() {
      this.getTypeList();
    },
    methods: {
      getTypeList() {
        this.listLoading = true;
        fetchTypeList().then(response => {
          this.dialogTypeSelection = this.dialogTypeSelection.concat(response.data);
          this.getList();
        })
      },
      getList() {
        this.listLoading = true;
        fetchCateList().then(response => {
          let tempList = response.data;
          // 按照id正序排序
          tempList.sort((a, b) => {
            return a.id - b.id;
          });
          // // 数据树形格式化(按照父子关系)
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
      // 数据排序格式化
      treeToArr(data, parent = null, level = null) {
        let tmp = [];
        Array.from(data).forEach((v) => {
          if (v._expanded === undefined) {
            v._expanded = true;
          }
          let _level = 1;
          if (level !== undefined && level !== null) {
            _level = level + 1
          }
          v._level = _level;
          if (parent) {
            v.parent = parent
          }
          tmp.push(v);
          if (v.children && v.children.length > 0) {
            tmp = tmp.concat(this.treeToArr(v.children, v, _level))
          }
        });
        return tmp;
      },
      // type-name处理
      typeNameComputed(type) {
        let tmp = this.dialogTypeSelection.filter((c) => {
          return c.code === type;
        });
        return tmp.length > 0 ? tmp[0].name : '';
      },
      // table-行展示形式
      showRow: function (row) {
        const show = (row.row.parent ? (row.row.parent._expanded && row.row.parent._show) : true);
        row.row._show = show;
        return show ? 'animation:treeTableShow 1s;-webkit-animation:treeTableShow 1s;' : 'display:none;'
      },
      // table-打开下一级 & 图标显示
      iconShow(record) {
        let children = this.list.filter(v => {
          return v.parentId === record.id;
        });
        return children.length > 0;
      },
      // table-下级展开
      toggleExpanded: function (trIndex) {
        const record = this.list[trIndex];
        record._expanded = !record._expanded
      },
      // dialog-重置temp
      resetTemp() {
        this.temp = {
          id: undefined,
          // 父分类
          parentId: 0,
          parentName: '',
          path: '',
          pathName: '',
          type: 'menu'// 该类别类型（menu/等）
        };
      },
      // dialog-新建窗口
      handleCreate() {
        this.resetTemp();
        this.dialogStatus = 'create';
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys([]);
          this.$refs['dataForm'].clearValidate()
        })
      },
      // dialog-新建窗口
      handleCreateRow(row) {
        this.resetTemp();
        this.temp.parentId = row.id;
        this.temp.parentName = row.pathName;
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate();
          this.$refs.tree.setCheckedKeys([]);
          this.$refs.tree.setCheckedKeys([row.id]);
        })
      },
      // dialog-切换选择父类
      onCheckCate(data, checked, indeterminate) {
        // 当前选择项
        if (checked) {
          this.$refs.tree.setCheckedKeys([]);
          this.$refs.tree.setCheckedKeys([data.id]);
          this.temp.parentId = data.id;
          this.temp.parentName = data.pathName;
        } else {
          let checks = this.$refs.tree.getCheckedKeys();
          if (checks.length === 0) {
            this.temp.parentId = 0;
            this.temp.parentName = '';
          }
        }
      },
      // dialog-保存分类
      saveData() {
        this.loading = true;
        saveCate(this.temp).then(() => {
          this.loading = false;
          this.getList();
          this.dialogFormVisible = false;
          this.$notify({
            title: this.$t('message.success'),
            message: this.$t('message.operSuccess'),
            type: 'success',
            duration: 2000
          })
        }).catch(() => {
          this.loading = false
        });
      },
      // dialog-编辑窗口
      handleUpdate(row) {
        let parentName = '';
        if (row.parent) {
          parentName = row.parent.pathName;
        }
        this.temp = {
          id: row.id,
          parentId: row.parentId,
          parentName: parentName,
          path: row.path,
          pathName: row.pathName,
          type: row.type// 该类别类型（menu/等）
        };
        // copy obj
        this.dialogStatus = 'update';
        this.dialogFormVisible = true;
        // 渲染完成后操作
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
          this.$refs.tree.setCheckedKeys([]);
          if (row.parent) {
            this.$refs.tree.setCheckedKeys([row.parentId]);
          }
        })
      },
      // action-删除
      handleDelete(row) {
        this.btnLoading = 'delete-' + row.id;
        removeCate(row.id).then(() => {
          this.getList();
          this.$notify({
            title: this.$t('message.success'),
            message: this.$t('message.operSuccess'),
            type: 'success',
            duration: 2000
          });
          this.btnLoading = ''
        }).catch(() => {
          this.btnLoading = ''
        })
      },
      // tree-设置禁用
      disableTree(data) {
        return data.id === this.temp.id;
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
