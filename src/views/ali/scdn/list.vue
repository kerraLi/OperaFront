<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input 
        :placeholder="$t('table.user.username')" 
        v-model="userName" 
        style="width: 200px;" 
        class="filter-item"
        @keyup.enter.native="getList"/>
      <el-input 
        :placeholder="$t('table.ali.scdn.domainName')" 
        v-model="domainName" 
        style="width: 200px;" 
        class="filter-item"
        @keyup.enter.native="getList"/>
      <el-select 
        v-model="domainStatus" 
        :placeholder="$t('table.ali.scdn.domainStatus')" 
        clearable 
        class="filter-item">
        <el-option
          v-for="item in statusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"/>
      </el-select>
      <el-select 
        v-model="sslProtocol"
        :placeholder="$t('table.ali.scdn.sslProtocol')"
        clearable 
        class="filter-item">
        <el-option
          v-for="item in httpsOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"/>
      </el-select>
      <el-checkbox 
        v-model="ifMarked" 
        class="filter-item" 
        style="margin-left:15px;margin-right: 15px;">
        标记弃用
      </el-checkbox>
      <el-button 
        class="filter-item" 
        type="primary" 
        icon="el-icon-search"
        @click="getList">
        {{ $t('table.search') }}
      </el-button>

      <el-button 
        :loading="btnLoading === 'allDeprecated'" 
        class="filter-item" 
        type="primary"
        icon="el-icon-check"
        @click="updateAbandonAll(true)">
        {{ $t('table.allDeprecated') }}
      </el-button>
      <el-button 
        :loading="btnLoading === 'allNoDeprecated'" 
        class="filter-item" 
        type="primary"
        icon="el-icon-close"
        @click="updateAbandonAll(false)">
        {{ $t('table.allNoDeprecated') }}
      </el-button>
    </div>


    <el-table
      v-loading="listLoading"
      :data="tableData"
      border
      fit
      highlight-current-row
      row-key="id"
      style="width: 100%;"
      @selection-change="handleChecked">
      <el-table-column
        type="selection"
        width="40"
      />
      <el-table-column 
        :label="$t('table.id')" 
        prop="id" 
        align="center" 
        width="40" 
        type="index"/>
      <el-table-column 
        :label="$t('table.user.username')" 
        min-width="30px">
        <template slot-scope="scope">
          <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column 
        :label="$t('table.ali.scdn.domainName')" 
        min-width="50px">
        <template slot-scope="scope">
          <span>{{ scope.row.domainName }}</span>
          <el-tag 
            v-if="scope.row.abandon=='1'" 
            type="danger">弃用数据</el-tag>
        </template>
      </el-table-column>
      <el-table-column 
        :label="$t('table.ali.scdn.cname')" 
        min-width="30px">
        <template slot-scope="scope">
          <span>{{ scope.row.cname }}</span>
        </template>
      </el-table-column>
      <el-table-column 
        :label="$t('table.ali.scdn.domainStatus')" 
        min-width="30px" 
        align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.domainStatus | statusFilter">{{ scope.row.domainStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column 
        :label="$t('table.ali.scdn.gmtCreated')" 
        min-width="40px" 
        align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.gmtCreated }}</span>
        </template>
      </el-table-column>
      <el-table-column 
        :label="$t('table.ali.scdn.gmtModified')" 
        min-width="40px" 
        align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.gmtModified }}</span>
        </template>
      </el-table-column>
      <el-table-column 
        :label="$t('table.ali.scdn.description')" 
        min-width="40px" 
        align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column 
        :label="$t('table.ali.scdn.sslProtocol')"
        min-width="30px" 
        align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.sslProtocol == 'on'">https</span>
          <span v-if="scope.row.sslProtocol == 'off'">http</span>
        </template>
      </el-table-column>
      <el-table-column 
        :label="$t('table.ali.scdn.resourceGroupId')" 
        min-width="40px" 
        align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.resourceGroupId }}</span>
        </template>
      </el-table-column>

      <el-table-column 
        :label="$t('table.actions')" 
        align="center" 
        width="100" 
        class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button 
            v-if="scope.row.abandon=='0'" 
            size="mini" 
            type="danger"
            @click="updateAbandon(scope.row,true)">弃用
          </el-button>
          <el-button 
            v-if="scope.row.abandon=='1'" 
            size="mini" 
            type="success" 
            style="width: 66px"
            @click="updateAbandon(scope.row,false)">取消弃用
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :total="total"
      :page-size="limit"
      :current-page="page"
      background
      layout="total,prev, pager, next"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
  import { scdnList,scdnUpdateAbandon } from '@/api/ali'
  const statusOptions =[
    {label:'online',value:'online'},
    {label:'offline',value:'offline'},
    {label:'configuring',value:'configuring'},//配置中
    {label:'configureFailed',value:'configure_failed'},//配置失败
    {label:'checking',value:'checking'},//审核中
    {label:'checkFailed',value:'check_failed'},//审核失败
    ];
  const httpsOptions =[
    {label:'https',value:'on'},
    {label:'http',value:'of'}
  ];

  export default {
    name: "ScdnList",
    filters: {
      statusFilter(status) {
        const statusMap = {
          online: 'success',
          offline: 'danger',
          configuring: 'success',
          configure_failed: 'danger',
          checking: 'success',
          check_failed: 'danger',
        }
        return statusMap[status]
      }
    },
    data(){
      return{
        page:1,
        limit:10,
        total:0,
        userName:null,
        domainName:null,
        domainStatus:null,
        sslProtocol:null,
        statusOptions,
        httpsOptions,
        tableData:null,
        checkList: [],

        btnLoading: '',
        ifMarked:false,
        listLoading:false
      }
    },
    created(){
      this.getList();
    },
    methods:{
      handleChecked(val) {
        this.checkList = val;
      },
      getList(){
        this.listLoading = true;
        let data = {
          page:this.page,
          limit:this.limit,
          userName: this.userName,
          domainName:this.domainName,
          domainStatus:this.domainStatus,
          sslProtocol:this.sslProtocol,
          abandon:this.abandon(this.ifMarked)
        };
        scdnList(data).then(response => {
          this.tableData = response.data.result.content;
          // console.log(response.data.result);
          this.listLoading = false;
          this.total = response.data.result.totalElements;
        })
      },
      //分页
      handleCurrentChange: function (currentPage) {
        this.page = currentPage;
        this.getList()
      },
      abandon(ifMarked){
        if(ifMarked){
          return 1;
        }else {
          return 0;
        }
      },

      updateAbandonAll(flg){
        let ids = this.checkList.map(o=>{
          return o.id;
        });
        let data ={
          ids:ids,
          abandon:this.abandon(flg)
        }
        scdnUpdateAbandon(data).then(() =>{
          this.getList()
          this.$notify({
            title: this.$t('message.success'),
            message: this.$t('message.operSuccess'),
            type: 'success',
            duration: 2000
          })
        });
      },
      updateAbandon(row,flg){
        this.checkList=[]
        this.checkList.push(row)
        this.updateAbandonAll(flg);
      }
    }
  }
</script>

<style scoped>

</style>
