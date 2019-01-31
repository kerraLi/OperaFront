import request from '@/utils/request'

// 数据量少&去掉分页参数
export function fetchAccountList() {
  return request({
    url: '/aws/account/list',
    method: 'get'
  })
}

export function createAccount(data) {
  return request({
    url: '/aws/account/save',
    method: 'post',
    params: data
  })
}

export function updateAccount(data) {
  return request({
    url: '/aws/account/save',
    method: 'post',
    params: data
  })
}

export function deleteAccount(id) {
  return request({
    url: '/aws/account/delete/' + id,
    method: 'post'
  })

}


/**
 * ec2
 */

export function fetchEc2List(data) {
  return request({
    url: '/aws/ec2/list',
    method: 'post',
    params: data
  })
}
