import request from '@/utils/request'

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

export function fetchEcsList(data) {
  return request({
    url: '/ali/ecs/list',
    method: 'post',
    params: data
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

export function fetchCdnRefreshList(data) {
  return request({
    url: '/ali/cdn/refresh/list',
    method: 'post',
    data
  })
}
