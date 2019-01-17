<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
  import echarts from 'echarts'

  require('echarts/theme/macarons') // echarts theme
  import { debounce } from '@/utils'

  const animationDuration = 2000

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
      // 继承表单数据
      chartData: {
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
      chartData: {
        deep: true,
        handler(val) {
          this.setOptions(val)
        }
      }
    },
    mounted() {
      // 初始化图标（echarts初始化必须绑定dom，所以在mounted中初始化）
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
      // 初始化
      initChart() {
        this.chart = echarts.init(this.$el, 'macarons')
        this.setOptions(this.chartData)
      },
      // 配置
      setOptions({ xData, normal, invalid, expired, deprecated } = {}) {
        this.chart.setOption({
          title: {
            text: '资源总计',
            textStyle: {
              color:"#5ab1ef",
              fontWeight: "bolder",
              fontSize: 20
            },
            left: "center"
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
              type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          grid: {
            top: 10,
            left: '2%',
            right: '2%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [{
            type: 'category',
            data: xData,
            axisTick: {
              alignWithLabel: true
            }
          }],
          yAxis: [{
            type: 'value',
            axisTick: {
              show: false
            }
          }],
          series: [{
            name: '正常',
            type: 'bar',
            stack: 'vistors',
            barWidth: '60%',
            data: normal,
            label: {
              show: true,
              formatter: '{a} - {c}'
            },
            animationDuration
          }, {
            name: '异常',
            type: 'bar',
            stack: 'vistors',
            barWidth: '60%',
            data: invalid,
            label: {
              show: true,
              formatter: '{a} - {c}'
            },
            animationDuration
          }, {
            name: '即将过期',
            type: 'bar',
            stack: 'vistors',
            barWidth: '60%',
            data: expired,
            label: {
              show: true,
              formatter: '{a} - {c}'
            },
            animationDuration
          }, {
            name: '弃用',
            type: 'bar',
            stack: 'vistors',
            barWidth: '60%',
            data: deprecated,
            label: {
              show: true,
              formatter: '{a} - {c}'
            },
            animationDuration
          }]
        })
      }
    }
  }
</script>
