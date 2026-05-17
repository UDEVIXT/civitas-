import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:3001/api/",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(undefined);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

   if (error.response?.status === 401 && !originalRequest._retry) {
      
      // CORRECCIÓN: Si el error 401 viene de verificar código o hacer login,
      // NO intentamos refrescar el token. Devolvemos el error original al componente.
      const rutasSinAutenticacion = ["/auth/login", "/auth/forgot-password", "/auth/verify-code", "/auth/reset-password"];
      if (originalRequest.url && rutasSinAutenticacion.some(ruta => originalRequest.url.includes(ruta))) {
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh");
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        
        // CORRECCIÓN: Evaluar si la ruta actual es pública antes de expulsar al usuario
        const currentPath = window.location.pathname;
        const isPublicRoute = currentPath === "/login" || currentPath.startsWith("/recuperar-contrasena");
        
        // Solo redirigimos si el usuario estaba navegando en una zona privada (ej. /dashboard)
        if (!isPublicRoute) {
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
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
          console.error("No autorizado. Redirigiendo al login...");
          // Ej: Lógica para cerrar sesión o refrescar token
          // window.location.href = '/login';
          break;
        case 403:
          console.error("Acceso denegado. No tienes los permisos necesarios.");
          break;
        case 404:
          console.error("Recurso no encontrado.");
          break;
        case 500:
          console.error("Error interno del servidor.");
          break;
        default:
          console.error(`Error HTTP: ${status}`);
      }
    } else if (error.request) {
      console.error("Error de red. Verifica tu conexión a internet.");
    } else {
      console.error("Error procesando la petición:", error.message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
