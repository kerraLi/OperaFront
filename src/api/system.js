import request from '@/utils/request'

export function fetchHandleLog(data) {
  return request({
    url: '/log/handle/list',
    method: 'get',
    params: data
  })
}

/**
 * refresh
 */
export function fetchRefreshList() {
  return request({
    url: '/refresh/list',
    method: 'get',
  })
}

export function refreshData(type) {
  return request({
    url: '/refresh/data/' + type,
    method: 'post'
  })
}

/**
 * parameter
 */
// 数据量少&去掉分页参数
export function fetchList() {
  return request({
    url: '/parameter/list',
    method: 'post'
  })
}

export function create(key, value, introduce) {
  let data = new URLSearchParams();
  data.append('key', key);
  data.append('value', value);
  data.append('introduce', introduce);
  return request({
    url: '/parameter/create',
    method: 'post',
    data
  })
}

export function update(id, status) {
  let data = new URLSearchParams();
  data.append('value', status);
  return request({
    url: '/parameter/update/' + id,
    method: 'post',
    data
  })
}

export function remove(id) {
  return request({
    url: '/parameter/delete/' + id,
    method: 'get'
  })
}
