import request from '@/utils/request'

export function fetchNum() {
  return request({
    url: '/dash/number',
    method: 'get'
  })
}

export function fetchMessage() {
  return request({
    url: '/dash/message',
    method: 'get'
  })
}

export function fetchAccount() {
  return request({
    url: '/dash/account',
    method: 'get'
  })
}
