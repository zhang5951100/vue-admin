import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getUser() {
  return request({
    url: '/user/users',
    method: 'get'
  })
}

export function addUser(data) {
  return request({
    url: '/user/users',
    method: 'post',
    data
  })
}

export function updateUser(id, data) {
  return request({
    url: `/user/users/${id}`,
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `/user/users/${id}`,
    method: 'delete'
  })
}
