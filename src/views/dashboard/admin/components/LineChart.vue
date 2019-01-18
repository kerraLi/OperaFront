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
        default: '460px'
      },
      autoResize: {
        type: Boolean,
        default: true
      },
      chartData: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        chart: null,
        sidebarElm: null
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
      if (this.autoResize) {
        this.__resizeHandler = debounce(() => {
          if (this.chart) {
            this.chart.resize()
          }
        }, 100)
        window.addEventListener('resize', this.__resizeHandler)
      }

      // 监听侧边栏的变化
      this.sidebarElm = document.getElementsByClassName('sidebar-container')[0]
      this.sidebarElm && this.sidebarElm.addEventListener('transitionend', this.sidebarResizeHandler)
    },
    beforeDestroy() {
      if (!this.chart) {
        return
      }
      if (this.autoResize) {
        window.removeEventListener('resize', this.__resizeHandler)
      }

      this.sidebarElm && this.sidebarElm.removeEventListener('transitionend', this.sidebarResizeHandler)

      this.chart.dispose()
      this.chart = null
    },
    methods: {
      sidebarResizeHandler(e) {
        if (e.propertyName === 'width') {
          this.__resizeHandler()
        }
      },
      initChart() {
        this.chart = echarts.init(this.$el, 'macarons')
        this.setOptions(this.chartData)
      },
      setOptions({ dateData, aliMoney, aliExpired, godaddyExpired, webhookAlert } = {}) {
        this.chart.setOption({
          xAxis: {
            data: dateData,
            boundaryGap: false,
            axisTick: {
              show: false
            }
          },
          grid: {
            left: 10,
            right: 10,
            bottom: 20,
            top: 30,
            containLabel: true
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            },
            padding: [5, 10]
          },
          yAxis: {
            axisTick: {
              show: false
            }
          },
          legend: {
            data: ['Ali-续费', 'Ali-过期', 'Godaddy-过期', 'Webhook-报警']
            // data: ['expected', 'actual']
          },
          series: [
            {
              name: 'Ali-续费',
              itemStyle: {
                normal: {
                  color: '#FF005A',
                  lineStyle: {
                    color: '#FF005A',
                    width: 2
                  }
                }
              },
              smooth: true,
              type: 'line',
              data: aliMoney,
              animationEasing: 'cubicInOut',
              animationDuration
            },
            {
              name: 'Ali-过期',
              smooth: true,
              type: 'line',
              itemStyle: {
                normal: {
                  color: '#3888fa',
                  lineStyle: {
                    color: '#3888fa',
                    width: 2
                  },
                  areaStyle: {
                    color: '#f3f8ff'
                  }
                }
              },
              data: aliExpired,
              animationEasing: 'quadraticOut',
              animationDuration
            }, {
              name: 'Godaddy-过期', itemStyle: {
                normal: {
                  color: '#E9B7DA',
                  lineStyle: {
                    color: '#E9B7DA',
                    width: 2
                  }
                }
              },
              smooth: true,
              type: 'line',
              data: godaddyExpired,
              animationEasing: 'cubicInOut',
              animationDuration
            }, {
              name: 'Webhook-报警', itemStyle: {
                normal: {
                  color: '#CC9B6A',
                  lineStyle: {
                    color: '#CC9B6A',
                    width: 2
                  }
                }
              },
              smooth: true,
              type: 'line',
              data: webhookAlert,
              animationEasing: 'cubicInOut',
              animationDuration
            }
          ]
        })
      }
    }
  }
</script>
