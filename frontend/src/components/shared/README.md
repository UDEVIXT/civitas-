## Shared Components
Esta carpeta alberga componentes de propósito específico que son utilizados en múltiples vistas o módulos de la aplicación. Mientras que la carpeta UI contiene elementos genéricos (átomos), Shared contiene componentes compuestos que pueden manejar cierta lógica interna o estar ligados a modelos de datos del proyecto.

### Ejemplos de Uso
- Searchbars Especializadas: Buscadores que ya incluyen filtros específicos o lógica de autocompletado.
- Modales de Confirmación: Diálogos preconfigurados para acciones destructivas (ej. "Eliminar elemento").
- Cards de Entidad: Tarjetas que ya conocen la estructura de un objeto (ej. ProductCard, UserCard).
- Empty States: Vistas consistentes para cuando no hay resultados o datos que mostrar.

### Criterios de Inclusión
- Regla de Tres: Si un componente se usa en 3 o más pantallas diferentes, es un candidato ideal para esta carpeta.
- Composición: Generalmente están compuestos por dos o más componentes de la carpeta UI.
- Independencia de Ruta: No deben pertenecer a una sola página; si el componente solo tiene sentido en /dashboard, debe vivir dentro de la carpeta de esa página.