import axios, { AxiosError } from 'axios'
import Router from 'next/router'
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import { AuthTokenError } from './errors/authTokenError'

let isRefreshing = false
let failedRequestsQueue = []

export function setupApiClient(ctx = undefined) {

  let cookies = parseCookies(ctx)

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`
    }
  })
  
  api.interceptors.response.use(response => {
    return response
  }, (error: AxiosError) => {
    if (error.response.status === 401) {
  
      const data = error.response.data as any
  
      if (data?.code === 'token.expired') {
        cookies = parseCookies(ctx)
      
        const { 'nextauth.refreshToken' : refreshToken } = cookies
        const originalConfig = error.config
        
        if (!isRefreshing) {
          isRefreshing = true
  
          api.post('refresh', {
            refreshToken
          }).then(response => {
            const { token } = response.data
    
            setCookie(ctx, 'nextauth.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            })
            setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            })
    
            api.defaults.headers['Authorization'] = `Bearer ${token}`
  
            failedRequestsQueue.forEach(request => request.onSuccess(token))
            failedRequestsQueue = []
  
          }).catch(err => {
  
            failedRequestsQueue.forEach(request => request.onFailure(err))
            failedRequestsQueue = []
  
            if (process.browser) {
              destroyCookie(ctx, 'nextauth.token')
              destroyCookie(ctx, 'nextauth.refreshToken')
              Router.push('/')
            }
          }).finally(() => {
            
            isRefreshing = false
          })
        }
  
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers['Authorization'] = `Bearer ${token}`
  
              resolve(api(originalConfig))
            },
            onFailure: (err: AxiosError) => {
              reject(err)
            },
          })
        })
  
      } else {
        if (process.browser) {
          destroyCookie(ctx, 'nextauth.token')
          destroyCookie(ctx, 'nextauth.refreshToken')
          Router.push('/')
        } else {
          return Promise.reject(new AuthTokenError())
        }
      }
    }
  
    return Promise.reject(error)
  })

  return api
}