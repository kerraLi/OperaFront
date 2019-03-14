import request from '@/utils/request'

export function getNewNumber() {
  return request({
    url: '/message/number/new',
    method: 'get'
  })
}

export function fetchList(data) {
  return request({
    url: '/message/list',
    method: 'post',
    params: data
  })
}

export function fetchTypes() {
  return request({
    url: '/message/types',
    method: 'get',
  })
}

export function modifyStatus(status, id) {
  return request({
    url: '/message/status/' + status + '/' + id,
    method: 'post'
  })
}


export function modifyAllStatus(ids, status) {
  let data = new URLSearchParams();
  data.append("ids", ids);
  return request({
    url: '/message/status/' + status,
    method: 'post',
    data
  })
}
