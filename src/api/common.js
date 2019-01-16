import request from '@/utils/request'

// 标记属性
export function mark(firstDomain, domain, id) {
  return request({
    url: '/' + firstDomain + '/' + domain + '/param/mark/' + id,
    method: 'post'
  })
}

// 取消标记
export function unmark(firstDomain, domain, id) {
  return request({
    url: '/' + firstDomain + '/' + domain + '/param/unmark/' + id,
    method: 'post'
  })
}

// 标记弃用所有
export function markAll(firstDomain, domain, ids) {
  let data = new URLSearchParams();
  data.append("ids", ids);
  return request({
    url: '/' + firstDomain + '/' + domain + '/param/mark',
    method: 'post',
    data
  })
}

// 取消标记弃用所有
export function unmarkAll(firstDomain, domain, ids) {
  let data = new URLSearchParams();
  data.append("ids", ids);
  return request({
    url: '/' + firstDomain + '/' + domain + '/param/unmark',
    method: 'post',
    data
  })
}
