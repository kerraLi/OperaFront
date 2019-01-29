import request from '@/utils/request'

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
