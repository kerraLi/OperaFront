import request from '@/utils/request'

// 标记属性
export function ignoreSet(status, data) {
  return request({
    url: '/ignore/set/' + status,
    method: 'post',
    data
  })
}

// 标记弃用所有
export function ignoreSetBatch(status, data) {
  return request({
    url: '/ignore/set/batch/' + status,
    method: 'post',
    data
  })
}
