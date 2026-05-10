import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// 1. Creamos la instancia de Axios con la configuración base
const apiClient: AxiosInstance = axios.create({
  // Usa una variable de entorno para la URL base de tu backend (ej. NestJS)
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/',
  timeout: 10000, // Tiempo de espera (10 segundos)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Peticiones (Requests)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Aquí puedes obtener tu token de autenticación (localStorage, cookies, Zustand, Redux, etc.)
    const token = localStorage.getItem('token'); 

    // Si hay un token, lo inyectamos en las cabeceras de todas las peticiones
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    // Manejo de errores antes de que la petición sea enviada
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuestas (Responses)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Si la respuesta es exitosa (códigos 2xx), la devolvemos tal cual
    return response;
  },
  (error: AxiosError) => {
    // Manejo global de errores (códigos fuera de 2xx)
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          console.error('No autorizado. Redirigiendo al login...');
          // Ej: Lógica para cerrar sesión o refrescar token
          // window.location.href = '/login';
          break;
        case 403:
          console.error('Acceso denegado. No tienes los permisos necesarios.');
          break;
        case 404:
          console.error('Recurso no encontrado.');
          break;
        case 500:
          console.error('Error interno del servidor.');
          break;
        default:
          console.error(`Error HTTP: ${status}`);
      }
    } else if (error.request) {
      console.error('Error de red. Verifica tu conexión a internet.');
    } else {
      console.error('Error procesando la petición:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
