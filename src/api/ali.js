import request from '@/utils/request'

// 数据量少&去掉分页参数
export function fetchList() {
  return request({
    url: '/ali/account/list',
    method: 'get'
  })
}

export function fetchArticle(id) {
  return request({
    url: '/article/detail',
    method: 'get',
    params: { id }
  })
}

export function createAliAccount(data) {
  return request({
    url: '/ali/account/save',
    method: 'post',
    params: data
  })
}

export function updateAliAccount(data) {
  return request({
    url: '/ali/account/save',
    method: 'post',
    params: data
  })
}

export function deleteAliAccount(id) {
  return request({
    url: '/ali/account/delete/' + id,
    method: 'post'
  })

}
