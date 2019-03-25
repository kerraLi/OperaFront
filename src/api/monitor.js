import request from '@/utils/request'

/**
 * time point
 */
export function fetchTimePointList(data) {
  return request({
    url: '/monitor/time/point/list',
    method: 'post',
    params: data
  })
}


/**
 * domain point
 */

export function fetchPointList(data) {
  return request({
    url: '/monitor/domain/point/list',
    method: 'post',
    params: data
  })
}

export function savePoint(data) {
  return request({
    url: '/monitor/domain/point/save',
    method: 'post',
    data
  })
}

export function deletePoint(id) {
  return request({
    url: '/monitor/domain/point/remove/' + id,
    method: 'get'
  })
}

export function deleteAllPoint(ids) {
  let data = new URLSearchParams();
  data.append("ids", ids);
  return request({
    url: '/monitor/domain/point/remove',
    method: 'post',
    data
  })
}

/**
 * domain
 */
export function fetchDomainList(data) {
  return request({
    url: '/monitor/domain/domain/list',
    method: 'post',
    params: data
  })
}

export function saveDomain(data) {
  return request({
    url: '/monitor/domain/domain/save',
    method: 'post',
    data
  })
}

export function deleteDomain(id) {
  return request({
    url: '/monitor/domain/domain/remove/' + id,
    method: 'get'
  })
}

export function deleteAllDomain(ids) {
  let data = new URLSearchParams();
  data.append("ids", ids);
  return request({
    url: '/monitor/domain/domain/remove',
    method: 'post',
    data
  })
}

/**
 * speed
 */
export function speedTest(url) {
  return request({
    url: '/monitor/domain/speed/test',
    method: 'post',
    params: { 'url': url }
  })
}

export function speedMonitor() {
  return request({
    url: '/monitor/domain/speed/monitor',
    method: 'post',
  })
}
