## /lib
Contiene configuraciones específicas para librerías externas que necesitan ser adaptadas o inicializadas para el proyecto.

### Diferencia con Utils
Mientras que utils son funciones propias, lib suele ser un "wrapper" o puente para herramientas externas (ej: configuración de una instancia de QueryClient de React Query o un cliente de Stripe).

Esto centralizar el uso de librerías para que, si decides cambiar una, solo tengas que editar este archivo.