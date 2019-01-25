import request from '@/utils/request'

export function loginByUsername(username, password) {
  const data = {
    username,
    password
  }
  return request({
    url: '/user/login',
    method: 'post',
    params: data
    // data: Object.entries(data).map(el => el.join('=')).join('&'),
    // data 原来只是data=》data转成按元素传值
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'get'
  })
}

export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get',
  })
}

export function resetPassword(oldPwd, newPwd) {
  let data = new URLSearchParams();
  data.append('oldPwd', oldPwd);
  data.append('newPwd', newPwd);
  return request({
    url: '/user/reset/password',
    method: 'post',
    data
  })
}
