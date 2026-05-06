## Layout Components
Esta carpeta contiene los componentes estructurales que definen el esqueleto visual de la aplicación. A diferencia de los componentes comunes, los componentes de layout suelen ser persistentes entre navegaciones y definen las áreas principales de interacción.

### Contenido 
- Navbar: Navegación principal superior y menús de acceso rápido.
- Footer: Información de cierre, enlaces legales y redes sociales.
- Sidebar: Menús laterales de navegación interna o paneles de herramientas.
- Wrapper/Layout: Componente de orden superior que encapsula la estructura global para las páginas.

### Lineamientos de Uso
- Atomicidad: Estos componentes deben ser lo más genéricos posible. Los datos específicos de cada página deben pasarse vía props o mediante el children.
- Responsividad: Asegúrate de que cualquier cambio en estos componentes sea probado en dispositivos móviles y escritorio, ya que afectan a toda la aplicación.
- Estado Global: Evita manejar lógica de negocio pesada aquí; prioriza el uso de contextos para estados de autenticación o temas (Dark/Light mode).