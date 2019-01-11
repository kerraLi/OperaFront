import request from '@/utils/request'

// 标记属性
export function mark(firstDomain, domain, id) {
  return request({
    url: '/' + firstDomain + '/' + domain + '/mark/' + id,
    method: 'post'
  })
}

// 取消标记
export function unmark(firstDomain, domain, id) {
  return request({
    url: '/' + firstDomain + '/' + domain + '/unmark/' + id,
    method: 'post'
  })
}
