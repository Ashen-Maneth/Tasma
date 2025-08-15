import axios from 'axios';

const api = axios.get('https://adb9fb79-e283-41e7-8fae-33b859522126-00-3ufo6kw5zpcff.sisko.replit.dev/api/cadreRecords')


// Add a request interceptor to include the token in the headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
