import request from '@/utils/request'

/**
 * data
 */
export function uploadData(cateId, data) {
  return request({
    url: '/resource/data/upload/' + cateId,
    method: 'post',
    data
  })
}

export function fetchDataList(cateId, data) {
  return request({
    url: '/resource/data/list/' + cateId,
    method: 'post',
    params: data
  })
}

export function fetchDataDownload(cateId, data) {
  return request({
    url: '/resource/data/download/' + cateId,
    method: 'post',
    params: data
  })
}

export function saveData(data) {
  return request({
    url: '/resource/data/save',
    method: 'post',
    data
  })
}

export function deleteData(id) {
  return request({
    url: '/resource/data/remove/' + id,
    method: 'get'
  })
}

export function deleteAllData(ids) {
  let data = new URLSearchParams();
  data.append("ids", ids);
  return request({
    url: '/resource/data/remove',
    method: 'post',
    data
  })
}

/**
 * category 分类
 */

export function getCateInfo(path) {
  return request({
    url: '/resource/category/info/' + path,
    method: 'get'
  })
}

export function fetchCateList() {
  return request({
    url: '/resource/category/list',
    method: 'get',
  })
}

export function saveCate(data) {
  return request({
    url: '/resource/category/save',
    method: 'post',
    params: data
  })
}

export function removeCate(id) {
  return request({
    url: '/resource/category/delete/' + id,
    method: 'post'
  })
}

/**
 * type 类型
 */
export function getTypeInfo(code) {
  return request({
    url: '/resource/type/info/' + code,
    method: 'get'
  })
}

export function fetchTypeList() {
  return request({
    url: '/resource/type/list',
    method: 'get'
  })
}

export function saveType(data) {
  return request({
    url: '/resource/type/save',
    method: 'post',
    params: data
  })
}

export function removeType(id) {
  return request({
    url: '/resource/type/delete/' + id,
    method: 'get'
  })
}
