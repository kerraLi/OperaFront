<template>
  <div
    v-loading="loading"
    class="app-container"
    element-loading-spinner="el-icon-loading">
    <div class="app-container">
      <input
        ref="filElem"
        type="file"
        @change="fileChange">
      <el-button
        type="primary"
        size="mini"
        @click="uploadFile">{{ $t('table.upload') }}</el-button>

      <el-select v-model="fileType" placeholder="请选择文件类型" class="app-container">
        <el-option
          v-for="item in typeOptions"
          :key="item.fileType"
          :label="item.label"
          :value="item.fileType">
        </el-option>
      </el-select>
    </div>

    <el-row :gutter="24">
      <el-col :span="14">
        <div style="min-height: 30px;">
          <div
            v-if="!flg"
            class="editor-container">
            <markdown-editor
              v-model="content"
              :options="{hideModeSwitch:true,previewStyle:'tab'}"
              height="300px"/>
          </div>
        </div>
      </el-col>
      <el-col :span="10">
        <div>
          <el-table
            :data="tableData"
            stripe
            border
            fit
            style="width: 100%"
            @row-click="show">
            <el-table-column
              :label="$t('table.HistoricalRecord')"
              align="center">
              <el-table-column
                :label="$t('table.id')"
                prop="id"
                align="center"
                width="65"
                type="index"/>
              <el-table-column
                :label="$t('table.configManage.fileName')"
                min-width="50px"
                min-hi>
                <template slot-scope="scope">
                  <span>{{ scope.row.fileName }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('table.configManage.fileType')"
                min-width="40px">
                <template slot-scope="scope">
                  <span>{{ scope.row.fileType }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('table.configManage.state')"
                min-width="30px">
                <template slot-scope="scope">
                  <span
                    v-if="scope.row.state===1"
                    class=" el-icon-circle-check-outline "/>
                  <el-tag v-if="scope.row.state===2" type="info"
                  >{{ $t('table.Execution') }}</el-tag>
                  <span
                    v-if="scope.row.state===0"
                    class=" el-icon-circle-close-outline"/>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('table.configManage.runResult')"
                min-width="35px">
                <template slot-scope="scope">
                  <span
                    v-if="scope.row.runResult===1"
                    class=" el-icon-circle-check-outline "/>
                  <el-tag v-if="scope.row.runResult===2" type="info"
                  >{{ $t('table.Execution') }}</el-tag>
                  <span
                    v-if="scope.row.runResult===0"
                    class=" el-icon-circle-close-outline"/>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('table.configManage.createTime')"
                min-width="70px">
                <template slot-scope="scope">
                  <span>{{ scope.row.createTime }}</span>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import {uploadFile, list} from '@/api/configManage'
  import MarkdownEditor from '@/components/MarkdownEditor'

  const typeOptions = [{
    fileType: 'nginx-http',
      label: 'nginx-http'
    }, {
    fileType: 'nginx-https',
      label: 'nginx-https'
    }, {
    fileType: 'cert-key',
      label: 'cert-key'
    }, {
    fileType: 'cert-crt',
      label: 'cert-crt'
    }, {
    fileType: 'rewrite-rule',
      label: 'rewrite-rule'
    }, {
    fileType: 'config-lua',
    label: 'config-lua'
    }, {
    fileType: 'filebeat-yml',
    label: 'filebeat-yml'
    }];

  export default {
    name: "UploadConfig",
    components: {MarkdownEditor},

    data() {
      return {
        id: this.$route.query.id,
        file: null,
        content: null,
        fileName: null,
        flg: true,
        typeOptions,
        fileType:null,
        map1: new Map([['nginx-http','conf'], ['nginx-https','conf'],
          ['cert-key','key'], ['cert-crt','crt'], ['rewrite-rule','rule'],
          ['config-lua','lua'], ['filebeat-yml','yml']]),
        tableData: null,
        timer: null,//定时刷新历史记录
        loading:false,
      }
    },
    created() {
      if (!this.$route.query.id) {
        const self = this;
        this.$message({
          message: '请选择指定服务器进行上传',
          type: 'warning',
          onClose() {
            self.$router.push({ path: '/config/index' });
          }
        });
        return;
      }
      this.getList();
      clearInterval(this.timer);
      this.timer = null;
      this.setTimer()
    },
    destroyed(){
      clearInterval(this.timer);
      this.timer = null
    },
    methods: {
      getList() {
        let data = {
          serverId: this.id
        };
        list(data).then(response => {
          this.tableData = response.data.result
        })
      },
      addFile(file) {
        return new Promise(function (resolve) {
          let reader = new FileReader();
          reader.readAsText(file,'utf-8');
          reader.onload = function () {
            resolve(this.result)
          }
        })
      },
      fileChange() {
        this.file = this.$refs.filElem.files[0];
        // console.log(this.map1.get('Michael'))
        let self = this;
        this.addFile(this.file).then(function (result) {
          self.fileName =self.file.name;
          let suffix = self.file.name.split(".")[1];
          if (suffix == "yaml" || suffix == "lua" || suffix == "conf" || suffix == "rule") {
            self.flg = false;
            self.content = result;
          } else {
            self.flg = true
          }
        });
      },
      uploadFile() {//文件上传
        if (this.content == null && this.file == null) {
          this.$alert(this.$t('message.hardware.dataEmpty'), this.$t('message.confirmTitle'), {
            confirmButtonText: this.$t('message.confirm'),
          });
          return;
        }
        this.loading = true;
        var name = this.fileName;
        var blob = new Blob([this.content], {type: "text/plain"});
        var file = new File([blob], name);
        let param = new FormData();
        let suffix = name.split(".")[1];
        if(suffix != this.map1.get(this.fileType)){
          this.$alert(this.$t('message.fileUpload.fileTypeError'), this.$t('message.confirmTitle'), {
            confirmButtonText: this.$t('message.confirm'),
          });
          this.loading = false;
          return;
        }
        param.append("fileType", this.fileType);
        param.append("id", this.id);
        if (this.fileType == "nginx-http" || this.fileType == "nginx-https") {
          param.append('file', file);
          this.flg = false;
        } else {
          param.append('file', this.file)
        }
        uploadFile(param).then(() => {
          this.loading = false;
          this.getList();
          this.flg = true;
          this.$refs.filElem.value='';
          this.content = null;
          this.file = null;
          this.$notify({
            title: this.$t('message.success'),
            message: this.$t('message.operSuccess'),
            type: 'success',
            duration: 2000
          })
        })
      },
      //显示点击的历史记录
      show(row) {
        if (row.fileName == "http_proxy.conf" || row.fileName == "https_proxy.conf") {
          var str2 = row.content.replace(/<n>/g, "\r\n");
          // console.log(str2);
          this.content = str2;
          this.fileName = row.fileName;
          this.flg = false;
        }else {
          this.flg = true;
          this.$refs.filElem.value='';
          this.content = null;
          this.file = null;
        }
      },
      setTimer(){
        this.timer = setInterval(() => {
          this.getList()
        }, 10000)
      }
    }
  }
</script>

<style scoped>

</style>
