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
    url: (type && type !== '') ? '/permission/list/' + type : '/permission/list',
    method: 'post'
  })
}


/**
 * role
 */
export function getRolePermissions(roleId) {
  let data = new URLSearchParams();
  data.append("roleId", roleId);
  return request({
    url: '/role/permission/list',
    method: 'post',
    data
  })
}

export function saveRolePermissions(roleId, pIds) {
  let data = new URLSearchParams();
  data.append("pIds", pIds);
  data.append("roleId", roleId);
  return request({
    url: '/role/permission/save',
    method: 'post',
    data
  })
}

export function getRoleList() {
  return request({
    url: '/role/list',
    method: 'post'
  })
}

// 获取已分配权限角色
export function getRoleValidList() {
  return request({
    url: '/role/list/valid',
    method: 'post'
  })
}


export function saveRole(data) {
  return request({
    url: '/role/save',
    method: 'post',
    data
  })
}

export function removeRole(id) {
  return request({
    url: '/role/delete/' + id,
    method: 'post',
  })
}


/**
 * user
 */
export function getUserList(data) {
  return request({
    url: '/user/list',
    method: 'post',
    params: data
  })
}

export function saveUser(data) {
  return request({
    url: '/user/save',
    method: 'post',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: '/user/delete/' + id,
    method: 'post'
  })
}
