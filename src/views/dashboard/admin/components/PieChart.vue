<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
  import echarts from 'echarts'

  require('echarts/theme/macarons') // echarts theme
  import { debounce } from '@/utils'

  export default {
    props: {
      className: {
        type: String,
        default: 'chart'
      },
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '300px'
      },
      pieData: {
        type: Object,
        required: true
      }

    },
    data() {
      return {
        chart: null
      }
    },
    watch: {
      // 动态改变chartData，获取后重新setOption
      pieData: {
        deep: true,
        handler(val) {
          this.setOptions(val)
        }
      }
    },
    mounted() {
      this.initChart()
      this.__resizeHandler = debounce(() => {
        if (this.chart) {
          this.chart.resize()
        }
      }, 100)
      window.addEventListener('resize', this.__resizeHandler)
    },
    beforeDestroy() {
      if (!this.chart) {
        return
      }
      window.removeEventListener('resize', this.__resizeHandler)
      this.chart.dispose()
      this.chart = null
    },
    methods: {
      initChart() {
        this.chart = echarts.init(this.$el, 'macarons')
        this.setOptions(this.pieData)
      },
      setOptions({ type, username, theme, normal, invalid, expired, deprecated } = {}) {
        this.chart.setOption({
          title: {
            text: theme,
            subtext: type + '-' + username + '资源',
            textStyle: {
              color:"#5ab1ef",
              fontWeight: "bolder",
              fontSize: 13
            },
            subtextStyle: {
              color:"#5ab1ef",
              fontWeight: "bolder",
              fontSize: 20
            },
            left: "center",
            top: "bottom",
            itemGap: -30
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
          },
          calculable: true,
          series: [
            {
              name: type + '-' + username + '资源' + '-' + theme,
              type: 'pie',
              roseType: 'radius',
              radius: [15, 95],
              center: ['50%', '38%'],
              data: [
                { value: normal, name: '正常' },
                { value: invalid, name: '异常' },
                { value: expired, name: '即将过期' },
                { value: deprecated, name: '弃用' }
              ],
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    formatter: '{b} : {c} ({d}%)'
                  },
                  labelLine: { show: true }
                }
              },
              animationEasing: 'cubicInOut',
              animationDuration: 2000
            }
          ]
        })
      }
    }
  }
</script>
