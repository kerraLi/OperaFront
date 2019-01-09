import request from '@/utils/request'

// 数据量少&去掉分页参数
export function fetchAccountList() {
  return request({
    url: '/go/account/list',
    method: 'get'
  })
}

export function createAccount(data) {
  return request({
    url: '/go/account/save',
    method: 'post',
    params: data
  })
}

export function updateAccount(data) {
  return request({
    url: '/go/account/save',
    method: 'post',
    params: data
  })
}

export function deleteAccount(id) {
  return request({
    url: '/go/account/delete/' + id,
    method: 'post'
  })

}

export function fetchDomainList(data) {
  return request({
    url: '/go/domain/list',
    method: 'post',
    params: data
  })
}

export function fetchCertificateList(data) {
  return request({
    url: '/go/certificate/list',
    method: 'post',
    params: data
  })
}
