import request from '@/utils/request'


// 数据量少&去掉分页参数
export function fetchList() {
  return request({
    url: '/parameter/list',
    method: 'post'
  })
}


export function create(key, value) {
  let data = new URLSearchParams();
  data.append('key', key);
  data.append('value', value);
  return request({
    url: '/parameter/create',
    method: 'post',
    data
  })
}

export function update(id, status) {
  let data = new URLSearchParams();
  data.append('value', status);
  return request({
    url: '/parameter/update/' + id,
    method: 'post',
    data
  })
}

export function remove(id) {
  return request({
    url: '/parameter/delete/' + id,
    method: 'get'
  })
}
