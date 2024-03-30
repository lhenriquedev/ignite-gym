import { AppError } from '@utils/AppError'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://192.168.3.24:3333'
})

api.interceptors.request.use(async (config) => {
  return config
}, (error) => {
  return Promise.reject(error)
})

api.interceptors.response.use(async (response) => response, (error) => {
  // mensagem tratada pelo backend
  if (error.response && error.response.data) {
    return Promise.reject(new AppError(error.response.data.message))
  } else {
    // mensagem não tratada pelo backend -> erros mais genéricos
    return Promise.reject(error)
  }
})

export { api }