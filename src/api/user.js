import request from '@/utils/request'

/**
 * permission
 */

export function syncApiPermission() {
  return request({
    url: '/permission/api/refresh',
    method: 'post'
  })
}

export function syncMenuPermission(data) {
  return request({
    url: '/permission/menu/refresh',
    method: 'post',
    data: data
  })
}


export function getPermissionList(type) {
  return request({
    url: '/permission/list/' + type,
    method: 'post'
  })
}
