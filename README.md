# UPU San Borja — Landing Page

Landing responsive basada en el mockup aprobado de UPU San Borja.

## Cómo abrir

1. Descomprime el archivo ZIP y abre la carpeta en **Visual Studio Code**.
2. Abre `index.html` en tu navegador. También puedes utilizar **Live Server** de VS Code.
3. Para desplegar, arrastra la carpeta o el ZIP a **Netlify**.

No requiere instalar paquetes ni ejecutar comandos de compilación. Los estilos, scripts e imágenes son archivos locales; la tipografía utiliza Google Fonts con fuentes alternativas si no hay internet.

## Archivos

- `index.html`: estructura, header, footer, iconos y animación institucional de inicio.
- `styles.css`: diseño responsive y adaptable a desktop, tablet y móvil.
- `app.js`: tarjetas de temas, categorías internas, buscador y listado de visores.
- `assets/san-borja-aerea.jpg`: fotografía aérea original facilitada.
- `assets/logo-municipal.png`: logo institucional original completo.
- `assets/escudo-san-borja.png`: recorte del escudo del logo original para el header y footer.
- `assets/upu-logo.svg`: SVG original de UPU utilizado en el encabezado y la introducción animada.
- `assets/favicon.svg`: icono verde para la pestaña del navegador.

## Funcionalidades

- Header con UPU a la izquierda, enlaces centrales en desktop y escudo municipal a la derecha.
- Menú desplegable en móvil.
- Introducción animada con el logo de UPU en cada entrada o recarga de la página.
- Buscador en desktop y móvil que busca por el nombre y la descripción de categorías y visores.
- Cuatro tarjetas temáticas que abren **una vista propia** sin bajar a otra sección.
- Seis tarjetas de visores. Las áreas de imagen se dejan vacías con un fondo neutro hasta tener capturas.
- Visores con vínculos conocidos abren en una pestaña nueva. Las funciones todavía no publicadas se muestran como **Próximamente**.
- Vistas de datos abiertos, planeamiento, información institucional y catálogo de visores.

## Personalizar

- **Enlaces y visores:** editar `VIEWERS` y `EXTRA_RESOURCES` en `app.js`.
- **Temas:** editar `CATEGORIES` en `app.js`.
- **Colores y estilos:** editar variables en la primera línea de `styles.css`.
- **Tarjetas con imagen:** cambiar el contenido del bloque `.viewer-card__visual` en `viewerCard()` por una etiqueta `<img>` cuando tengas las capturas finales.
- **Foto de cabecera:** reemplazar `assets/san-borja-aerea.jpg` con otra foto manteniendo el mismo nombre.

**Nota:** Los archivos de descarga de datos abiertos y algunos visores mencionados en el mockup no tienen URL validada; no se han inventado recursos, por lo que se muestran como información o como «Próximamente».
