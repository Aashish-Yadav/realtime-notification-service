import axios from 'axios'

const api = axios.create({ baseURL: 'https://realtime-notification-service.onrender.com/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const sitesApi = {
  getAll:         ()         => api.get('/sites'),
  getById:        (id)       => api.get(`/sites/${id}`),
  update:         (id, data) => api.put(`/sites/${id}`, data),
  delete:         (id)       => api.delete(`/sites/${id}`),
  getSubscribers: (id)       => api.get(`/sites/${id}/subscribers`),
}

export const notifyApi = {
  send: (data) => api.post('/notify', data),
}

export const authApi = {
  regenerateKey: () => api.post('/auth/regenerate-key'),
}

export default api