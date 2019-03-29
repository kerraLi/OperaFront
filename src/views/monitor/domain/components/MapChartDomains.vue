<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
  import echarts from 'echarts'
  import { china } from './china.js';

  require('echarts/theme/macarons'); // echarts theme
  import { debounce } from '@/utils' // 防抖

  const animationDuration = 2000;

  export default {
    name: "MapChartDomains",
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
        default: '500px'
      },
      chartData: {
        type: Array,
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
      // 注册地图
      echarts.registerMap('china', china);
      // 初始化图标（echarts初始化必须绑定dom，所以在mounted中初始化）
      this.initChart();
      this.__resizeHandler = debounce(() => {
        if (this.chart) {
          this.chart.resize()
        }
      }, 100);
      // 窗口调整大小事件
      window.addEventListener('resize', this.__resizeHandler)
    },
    beforeDestroy() {
      if (!this.chart) {
        return
      }
      window.removeEventListener('resize', this.__resizeHandler);
      this.chart.dispose();
      this.chart = null
    },
    methods: {
      // 初始化
      initChart() {
        this.chart = echarts.init(this.$el, 'macarons');
        console.log(this.chartData);
        this.setOptions(this.chartData)
      },
      setOptions(list) {
        let series = [];
        let self = this;
        list.forEach((v) => {
          let temp = {
            name: v.url,
            type: 'map',
            mapType: 'china',
            roam: false,
            label: {
              normal: {
                show: true
              }
            },
            data: v.data
          };
          series.push(temp)
        });
        this.chart.setOption({
          title: {
            text: '网站速度监控',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: function (params) {
              if (params.name === '') {
                return '-'
              }
              let value = (params.value === undefined || params.value === '-') ? '-' : params.value.toFixed(2);
              let res = params.name + '<br/>平均时间:' + value + ' ms<br/>';
              return res;
            }
          },
          visualMap: {
            type: 'piecewise',
            min: 0,
            max: 2500,
            pieces: [
              { min: 5000, label: '>5000ms', color: 'red' },
              { min: 3000, max: 5000, label: '3000-5000ms', color: 'rgb(246, 152, 51)' },
              { min: 2000, max: 3000, label: '2000-3000ms', color: 'rgb(246, 237, 68)' },
              { min: 1000, max: 2000, label: '1000-2000ms', color: 'rgb(190, 246, 99)' },
              { min: 400, max: 1000, label: '400-1000ms', color: 'rgb(66, 221, 63)' },
              { max: 400, label: '<400ms', color: 'rgb(36, 170, 29)' },
            ]
          },
          mapValueCalculation: 'average',
          mapValuePrecision: 2,
          animationEasing: 'cubicInOut',
          animationDuration: animationDuration,
          series: series
        })
      }
    }
  }
</script>

<style scoped>

</style>
