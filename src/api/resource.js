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

export function createData(data) {
  return request({
    url: '/resource/data/save',
    method: 'post',
    data
  })
}

export function updateData(data) {
  return request({
    url: '/resource/data/save',
    method: 'post',
    data
  })
}

export function deleteData(id) {
  return request({
    url: '/hardware/remove/' + id,
    method: 'get'
  })
}

export function deleteAllData(ids) {
  let data = new URLSearchParams();
  data.append("ids", ids);
  return request({
    url: '/hardware/remove',
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

// 列表
export function fetchHardwareList(data) {
  return request({
    url: '/hardware/list',
    method: 'post',
    params: data
  })
}

// 创建
export function createHardware(data) {
  return request({
    url: '/hardware/save',
    method: 'post',
    data
  })
}

// 编辑
export function updateHardware(data) {
  return request({
    url: '/hardware/save',
    method: 'post',
    data
  })
}

// 删除
export function deleteHardware(id) {
  return request({
    url: '/hardware/remove/' + id,
    method: 'get'
  })
}

// 批量删除
export function deleteAllHardware(ids) {
  let data = new URLSearchParams();
  data.append("ids", ids);
  return request({
    url: '/hardware/remove',
    method: 'post',
    data
  })
}

// 上传
export function uploadHardware(tempData) {
  const data = tempData.map((c) => {
    return {
      'username': c['帐号'],
      'password': c['密码'],
      'cabinet': c['机柜'],
      'model': c['型号'],
      'assetNumber': c['资产编号'],
      'sn': c['SN'],
      'operateSystem': c['操作系统'],
      'effect': c['作用'],
      'externalIp': c['专线IP'],
      'externalMainLine': c['外网主线'],
      'externalBackupLine': c['外网备线'],
      'intranetIp': c['内网IP'],
      'manageCardIp': c['管理卡IP'],
      'mask': c['掩码'],
      'remotePort': c['远程端口'],
      'intranetPort': c['内网端口'],
      'managePort': c['管理端口'],
      'externalPort': c['专线端口'],
      'cpu': c['CPU'],
      'memory': c['内存'],
      'raid': c['RAID'],
      'hardDisk': c['硬盘'],
      'power': c['电源'],
      'uNumber': c['U数'],
      'remark': c['备注'],
    };
  });
  return request({
    url: '/hardware/upload',
    method: 'post',
    data
  })
}
