import request from '@/utils/request'

export function serverList(data) {
  return request({
    url: '/serverManage/list/'+data.page+'/'+data.limit,
    method: 'post',
    data:data
  })
}

export function addOrupdate(data) {
  return request({
    url: '/serverManage/addOrUpdate/',
    method: 'post',
    data:data
  })
}

export function deleted(data) {
  return request({
    url: '/serverManage/delete/'+data,
    method: 'post',
    data:data
  })
}

export function uploadFile(data) {
  return request({
    url: '/configManage/upload/',
    method: 'post',
    headers:{'Content-Type':'multipart/form-data'},
    data:data
  })
}
export function list(data) {
  return request({
    url: '/configManage/list',
    method: 'post',
    data: data
  })
}

