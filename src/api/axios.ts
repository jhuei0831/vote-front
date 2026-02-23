import axios from 'axios'

// create an axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/v1',
  timeout: 10000,
  withCredentials: true, // allow sending cookies with CORS requests
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // add token to headers if exists
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // handle error response
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized, clear login state and redirect to login page
          console.error('Unauthorized, please log in again')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          console.error('Forbidden, you do not have permission to access this resource')
          break
        case 404:
          console.error('Requested resource not found')
          break
        case 500:
          console.error('Internal server error, please try again later')
          break
        default:
          console.error('Request failed:', error.response.data?.message || error.message)
      }
    } else if (error.request) {
      console.error('Unable to connect to the server, please check your network connection')
    } else {
      console.error('Request error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
