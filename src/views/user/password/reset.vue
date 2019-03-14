<template>
  <div class="app-container">
    <div style="width: 40%;">
      <el-form ref="operForm" status-icon :model="operForm" :rules="operRules" label-width="150px">
        <el-form-item :label="$t('table.user.username')">
          <label>{{ name }}</label>
        </el-form-item>
        <el-form-item :label="$t('table.user.oldPwd')" prop="oldPwd">
          <el-input
            :type="passwordType"
            v-model="operForm.oldPwd"
            :placeholder="$t('login.password')"
            auto-complete="on"
            name="oldPwd"/>
        </el-form-item>
        <el-form-item :label="$t('table.user.newPwd')" prop="newPwd">
          <el-input
            :type="passwordType"
            v-model="operForm.newPwd"
            :placeholder="$t('login.password')"
            auto-complete="on"
            name="newPwd"/>
        </el-form-item>
        <el-form-item :label="$t('table.user.confirmPwd')" prop="confirmPwd">
          <el-input
            :type="passwordType"
            v-model="operForm.confirmPwd"
            :placeholder="$t('login.password')"
            auto-complete="on"
            name="confirmPwd"/>
        </el-form-item>
        <el-form-item>
          <el-button type="default" size="small"
                     @click.native.prevent="handleReset">
            {{ $t('table.reset') }}
          </el-button>
          <el-button type="primary" size="small"
                     @click.native.prevent="handleSubmit"
                     :loading="btnLoading === 'submit'">
            {{ $t('table.confirm') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: "PasswordReset",
    data() {
      const validatePassword = (rule, value, callback) => {
        if (value && value.length < 6) {
          callback(new Error('The password can not be less than 6 digits'))
        } else if (!value) {
          callback(new Error('The password is required'))
        } else {
          callback()
        }
      };
      const validateNewPassword = (rule, value, callback) => {
        if (value && value.length < 6) {
          callback(new Error('The password can not be less than 6 digits'))
        } else if (!value) {
          callback(new Error('The password is required'))
        } else {
          callback()
        }
      };
      const validateConfirmPassword = (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('The password can not be less than 6 digits'))
        } else if (value !== this.operForm.newPwd) {
          callback(new Error('The two password are not equal.'))
        } else {
          callback()
        }
      };
      return {
        btnLoading: '',
        operForm: {
          oldPwd: '',
          newPwd: '',
          confirmPwd: ''
        },
        operRules: {
          oldPwd: [{ required: true, trigger: 'blur', validator: validatePassword }],
          newPwd: [{ required: true, trigger: 'blur', validator: validateNewPassword }],
          confirmPwd: [{ required: true, trigger: 'blur', validator: validateConfirmPassword }]
        },
        passwordType: 'password'
      }
    },
    computed: {
      ...mapGetters([
        'name',
      ])
    },
    methods: {
      // 重置
      handleReset() {
        this.operForm = {
          oldPwd: '',
          newPwd: '',
          confirmPwd: ''
        };
      },
      // 提交
      handleSubmit() {
        this.$refs.operForm.validate(valid => {
          if (valid) {
            this.btnLoading = 'submit';
            this.$store.dispatch('resetPassword', this.operForm).then(() => {
              this.btnLoading = '';
              location.reload()
            }).catch(() => {
              this.btnLoading = '';
            })
          } else {
            return false
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
