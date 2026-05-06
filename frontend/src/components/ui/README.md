## UI Components
Esta carpeta es la biblioteca de componentes base (o sistema de diseño) de la aplicación. Contiene elementos atómicos y moleculares que son altamente reutilizables, visualmente consistentes y desacoplados de la lógica de negocio.

### Categorías Comunes
- Elementos de Formulario: Button, Input, Checkbox, Select.
- Visualización de Datos: Card, Badge, Avatar, Table.
- Feedback & Overlays: Modal, Toast, Tooltip, Spinner.
- Navegación Atómica: Breadcrumbs, Tabs.

### Principios de Diseño
- Pureza (Stateless): Los componentes de UI deben ser, en lo posible, componentes funcionales que dependan de props. No deben realizar peticiones a APIs directamente.
- Estilo Consistente: Se deben utilizar las variables de tema (colores, espaciados, bordes) definidas en el proyecto para asegurar la homogeneidad visual.
- Accesibilidad (A11y): Todo componente debe ser accesible (uso de roles ARIA, manejo de foco en modales, estados hover y active).
- Prop-Drilling Limitado: Si un componente de UI se vuelve demasiado complejo, considera dividirlo en sub-componentes más pequeños.