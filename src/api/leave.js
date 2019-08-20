import request from '@/utils/request'

export function start(operator, processName) {
  return request({
    url: `/workflow/start/${operator}/${processName}`,
    method: 'get'
  })
}

export function apply(data) {
  return request({
    url: '/workflow/applies',
    method: 'post',
    data
  })
}
