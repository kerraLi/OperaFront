<template>
  <div class="app-container">
    <el-row :gutter="32">
      <el-col v-for="item in list" :xs="24" :sm="24" :lg="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{ item.name }}</span>
            <el-button style="float: right; padding: 3px 0" type="text"
                       @click="handleRefresh(item.type)">
              刷新数据
            </el-button>
          </div>
          <el-form label-width="80px">
            <el-form-item label="数据类型">
              <span>{{ item.name }}</span>
            </el-form-item>
            <el-form-item label="最近刷新">
              <span v-if="item.last_date===0">无最近更新记录</span>
              <span v-else>{{ item.last_date| parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            </el-form-item>
          </el-form>

        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>
  import { fetchRefreshList, refreshData } from '@/api/system'

  export default {
    name: "DataRefresh",
    data() {
      return {
        list: null,
        listLoading: true,
      }
    },
    created() {
      fetchRefreshList().then(response => {
        this.list = response.data;
        this.listLoading = false;
      })
    },
    methods: {
      handleRefresh(dataType) {
        const h = this.$createElement;
        this.$msgbox({
          title: this.$t('message.confirmTitle'),
          type: 'warning',
          message: h('p', null, [
            h('span', null, '此操作将'),
            h('span', { style: 'color: red' }, '重新拉取' + dataType),
            h('span', null, '所有数据，操作将会在后台持续5-10分钟，是否确认？'),
          ]),
          showCancelButton: true,
          confirmButtonText: this.$t('message.confirm'),
          cancelButtonText: this.$t('message.cancel'),
          beforeClose: (type, instance, done) => {
            if (type === 'confirm') {
              instance.confirmButtonLoading = true;
              instance.confirmButtonText = this.$t('message.doing');
              refreshData(dataType).then(() => {
                this.$notify({
                  title: this.$t('message.success'),
                  message: this.$t('message.operSuccess'),
                  type: 'success',
                  duration: 2000
                });
                done();
                setTimeout(() => {
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
      }
    }
  }
</script>

<style scoped>
</style>
