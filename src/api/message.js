import request from '@/utils/request'

export function fetchList(data) {
  return request({
    url: '/message/list',
    method: 'post',
    params: data
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
