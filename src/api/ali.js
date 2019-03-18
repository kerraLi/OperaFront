import request from '@/utils/request'

// date格式化
Date.prototype.format = function (fmt) {
  let o = {
    "y+": this.getFullYear(),
    "M+": this.getMonth() + 1,                 //月份
    "d+": this.getDate(),                    //日
    "h+": this.getHours(),                   //小时
    "m+": this.getMinutes(),                 //分
    "s+": this.getSeconds(),                 //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S+": this.getMilliseconds()             //毫秒
  };
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      if (k == "y+") {
        fmt = fmt.replace(RegExp.$1, ("" + o[k]).substr(4 - RegExp.$1.length));
      } else if (k == "S+") {
        var lens = RegExp.$1.length;
        lens = lens == 1 ? 3 : lens;
        fmt = fmt.replace(RegExp.$1, ("00" + o[k]).substr(("" + o[k]).length - 1, lens));
      } else {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
    }
  }
  return fmt;
};

// 数据量少&去掉分页参数
export function fetchAccountList() {
  return request({
    url: '/ali/account/list',
    method: 'get'
  })
}

export function createAliAccount(data) {
  return request({
    url: '/ali/account/save',
    method: 'post',
    params: data
  })
}

export function updateAliAccount(data) {
  return request({
    url: '/ali/account/save',
    method: 'post',
    params: data
  })
}

export function deleteAliAccount(id) {
  return request({
    url: '/ali/account/delete/' + id,
    method: 'post'
  })
}

/**
 * ecs
 */

export function fetchEcsList(data) {
  return request({
    url: '/ali/ecs/list',
    method: 'post',
    params: data
  })
}

// 操作ecs
export function actionEcsStatus(id, action) {
  return request({
    url: '/ali/ecs/status/' + action + '/' + id,
    method: 'get',
  })
}

// 更新ecs状态
export function updateEcsStatue(id) {
  return request({
    url: '/ali/ecs/status/update/' + id,
    method: 'get'
  })
}

// 预付费服务器
export function perPayEcs(data) {
  return request({
    url: '/ali/ecs/perpay',
    method: 'post',
    data
  })
}

/**
 * cdn
 */

export function fetchCdnList(data) {
  return request({
    url: '/ali/cdn/list',
    method: 'post',
    params: data
  })
}

// 刷新 & 预热
export function createCdnRefresh(tempData) {
  let data = new URLSearchParams();
  for (let i in tempData) {
    data.append(i, tempData[i]);
  }
  return request({
    url: '/ali/cdn/refresh',
    method: 'post',
    data
  })
}

// 刷新任务列表
export function fetchCdnRefreshList(tempData) {
  tempData.operDate = tempData.operDate.map(function (e) {
    if (e instanceof Date) {
      return e.format("yyyy-MM-dd");
    } else {
      return e;
    }
  });
  let data = new URLSearchParams();
  for (let i in tempData) {
    if (tempData[i] !== undefined) {
      data.append(i, tempData[i]);
    }
  }
  return request({
    url: '/ali/cdn/refresh/task/list',
    method: 'post',
    data
  })
}

// 更新task状态
export function updateCdnRefreshTask(id) {
  return request({
    url: '/ali/cdn/refresh/task/update/' + id,
    method: 'get'
  })
}
//查询scdn列表
export function scdnList(data) {
  return request({
    url: '/ali/scdn/list/' + data.page+"/"+data.limit,
    method: 'post',
    data,
  })
}
//更新弃用状态
export function scdnUpdateAbandon(data) {
  return request({
    url: '/ali/scdn/updateAbandon',
    method: 'post',
    data,
  })
}
//刷新任务
export function createScdnRefresh(data) {
  return request({
    url: '/ali/scdn/addRefresh',
    method: 'post',
    data,
  })
}

//获取刷新纪录列表
export function refreshScdnList(data) {
  data.startTime = data.startTime.format("yyyy-MM-dd");
  data.endTime = data.endTime.format("yyyy-MM-dd");

  return request({
    url: '/ali/scdn/refreshList',
    method: 'post',
    data,
  })
}

//获取阿里最新刷新（预热）状态
export function updateScdnRefreshTask(data) {
  return request({
    url: '/ali/scdn/updateScdn/'+data,
    method: 'post',
  })
}
