import request from '@/utils/request'

/**
 * point
 */

export function fetchPointList(data) {
  return request({
    url: '/monitor/point/list',
    method: 'post',
    params: data
  })
}

export function savePoint(data) {
  return request({
    url: '/monitor/point/save',
    method: 'post',
    data
  })
}

export function deletePoint(id) {
  return request({
    url: '/monitor/point/remove/' + id,
    method: 'get'
  })
}

export function deleteAllPoint(ids) {
  let data = new URLSearchParams();
  data.append("ids", ids);
  return request({
    url: '/monitor/point/remove',
    method: 'post',
    data
  })
}

/**
 * speed
 */
export function connPoints(url) {
  return request({
    url: '/monitor/speed/test',
    method: 'post',
    params: { 'url': url }
  })
}
