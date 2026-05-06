## SVG Assets (Vectors)
Esta carpeta contiene gráficos vectoriales escalables.

### Lineamientos
**Uso:** Logotipos, iconos, ilustraciones planas y elementos decorativos que deban escalarse sin perder resolución.
**Atributos:** Asegurarse de que el SVG no tenga dimensiones fijas (`width`/`height`) si se desea controlar el tamaño mediante CSS/Tailwind, o que mantenga el `viewBox` correcto.
**Componentización:** Si el SVG se usará frecuentemente en React, considera si es mejor tenerlo aquí o convertirlo en un componente `.tsx`.