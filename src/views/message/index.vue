<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input 
        v-model="listQuery.key" 
        placeholder="Key" 
        clearable 
        style="width: 200px;" 
        class="filter-item"
        @keyup.enter.native="handleFilter"/>
      <el-select 
        v-model="listQuery.status" 
        placeholder="Status" 
        clearable 
        class="filter-item"
        style="width: 130px">
        <el-option 
          v-for="item in statusOptionsChoice" 
          :key="item.key" 
          :label="item.display_name"
          :value="item.key"/>
      </el-select>
      <el-select 
        v-model="listQuery.title" 
        placeholder="Title" 
        clearable 
        class="filter-item">
        <el-option 
          v-for="item in themeOptionsChoice" 
          :key="item" 
          :label="item"
          :value="item"/>
      </el-select>
      <el-button 
        v-waves 
        class="filter-item" 
        type="primary" 
        icon="el-icon-search" 
        @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button 
        v-waves 
        class="filter-item" 
        type="primary" 
        icon="el-icon-check" 
        @click="modifyAllStatus('finish')">
        {{ $t('table.allFinish') }}
      </el-button>
    </div>


    <el-table
      v-loading="listLoading"
      :data="list"
      :expand-row-keys="expands"
      row-key="id"
      style="width: 100%"
      @selection-change="handleChecked"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column type="expand">
        <template slot-scope="props">
          <div 
            style="line-height: 30px;font-size: initial;" 
            v-html="props.row.message"/>
          <el-form 
            label-position="left" 
            inline 
            class="demo-table-expand">
            <el-form-item label="消息ID">
              <span>{{ props.row.id }}</span>
            </el-form-item>
            <el-form-item label="消息类型">
              <span>{{ props.row.title }}</span>
            </el-form-item>
            <el-form-item label="创建时间">
              <span>{{ props.row.createdTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            </el-form-item>
            <el-form-item label="修改时间">
              <span>{{ props.row.modifyTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            </el-form-item>
            <el-form-item label="消息主体">
              <span>{{ props.row.theme }}</span>
            </el-form-item>
            <el-form-item label="主体数据">
              <span>{{ props.row.themeId }}</span>
            </el-form-item>
            <el-button 
              v-if="props.row.status ==='new'" 
              size="mini" 
              type="primary"
              @click="modifyStatus(props.row,'active')">开始
            </el-button>
            <el-button 
              v-if="props.row.status !=='finish'" 
              size="mini" 
              type="success"
              @click="modifyStatus(props.row,'finish')">完成
            </el-button>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column 
        :label="$t('table.id')" 
        prop="id" 
        align="center" 
        width="65" 
        type="index"/>
      <el-table-column
        label="CreatedTime" 
        width="200" 
        align="center"
        prop="createdTime">
        <template slot-scope="scope">
          <span>{{ scope.row.createdTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="ModifyTime" 
        width="200" 
        align="center"
        prop="modifyTime">
        <template slot-scope="scope">
          <span>{{ scope.row.modifyTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.type')" 
        width="150" 
        align="center"
        prop="title">
        <template slot-scope="scope">
          <el-tag :type="scope.row.title | typeFilter">{{ scope.row.title }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="Theme" 
        width="100" 
        align="center"
        prop="theme"/>
      <el-table-column
        label="ThemeId" 
        width="300" 
        align="center"
        prop="themeId"/>
      <el-table-column
        label="Message"
        prop="message"
      >
        <template slot-scope="scope">
          <span
            style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ scope.row.message | filterHtml }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.status')"
        width="100" 
        align="center"
        prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.actions')"
        width="200" 
        align="center">
        <template slot-scope="scope">
          <el-button 
            v-if="scope.row.status ==='new'" 
            size="mini" 
            type="primary"
            @click="modifyStatus(scope.row,'active')">开始
          </el-button>
          <el-button 
            v-if="scope.row.status !=='finish'" 
            size="mini" 
            type="success"
            @click="modifyStatus(scope.row,'finish')">完成
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination 
      v-show="total>0" 
      :total="total" 
      :page.sync="listQuery.page" 
      :limit.sync="listQuery.limit"
      @pagination="getList"/>

  </div>
</template>

<script>
  import { fetchList, fetchTypes, modifyStatus, modifyAllStatus } from '@/api/message'
  import waves from '@/directive/waves' // Waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

  const statusOptionsChoice = [
    { key: 'new', display_name: 'new' },
    { key: 'active', display_name: 'active' },
    { key: 'finished', display_name: 'finished' },
  ];

  export default {
    name: 'Message',
    components: { Pagination },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          new: 'default',
          finish: 'success',
          active: 'danger'
        };
        return statusMap[status]
      },
      typeFilter(type) {
        const typeMap = {
          '续费': 'default',
          '过期': 'success',
          '报警': 'danger'
        };
        return typeMap[type]
      },
      filterHtml(message) {
        return message.replace(/<[^>]+>/g, "")
      }
    },
    data() {
      return {
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20,
          key: undefined,
          status: undefined,
          title: undefined
        },
        statusOptionsChoice,
        themeOptionsChoice: null,
        showReviewer: false,
        pvData: [],
        downloadLoading: false,
        expands: [],
        checkList: []
      }
    },
    created() {
      // 单独调用方法 设置then
      this.listLoading = true;
      if (this.$route.params.themeId !== undefined) {
        this.listQuery.key = this.$route.params.themeId
      }
      this.getList();
      // 初始化types
      if (!this.themeOptionsChoice) {
        fetchTypes().then(response => {
          this.themeOptionsChoice = response.data;
        })
      }
    },
    methods: {
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.total = response.data.total;
          this.list = response.data.items;
          this.listLoading = false;
          // 展开
          const openId = this.$route.params.openId;
          if (openId !== undefined) {
            // list
            this.expands.push(openId)
          } else {
            this.$store.dispatch('GetMessageNum');
          }
        })
      },
      // 切换标记
      handleChecked(val) {
        this.checkList = val;
      },
      // 标记使用
      modifyStatus(row, status) {
        modifyStatus(status, row.id).then(response => {
          this.$message({
            message: '操作成功',
            type: 'success'
          });
          this.$store.dispatch('SubMessageNum', 1);
          row.status = status
        })
      },
      // 批量标记完成
      modifyAllStatus(status) {
        modifyAllStatus(this.checkList.map((c) => {
          return c.id;
        }), status).then(response => {
          this.$message({
            message: '操作成功',
            type: 'success'
          });
          this.getList()
        })
      },
      // 搜索
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
    }
  }
</script>

<style scoped>
  .demo-table-expand {
    font-size: 0;
  }

  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }

  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
