# Laboratorio 4: Formularios, validaciones, e introducción a APIs de georeferenciación

En este laboratorio continuaremos desarrollando la aplicación de clima con React y MUI. La aplicación utiliza la API de [Open-Meteo](https://open-meteo.com/) para acceder a información climática.

## Pasos iniciales

El primer paso es ejecutar:

```sh
yarn install
```

Esto instalará todos los paquetes o módulos especificados en el archivo `package.json` que requiere la aplicación. Preferimos utilizar Yarn para gestión de módulos y dependencias de Javascript.

Con esto, la aplicación estará lista para ejecutar:

```sh
yarn dev
```

El comando anterior ejecuta la aplicación en modo de desarrollo. Puedes abrir el navegador web en [http://localhost:5173/](http://localhost:5173/) para ver el funcionamiento.

## Marco Teórico

### Uso de APIs remotas

En los laboratorios anteriores hemos usado la API de Open-Meteo para consultar información climática para ubicaciones geográficas de interés. Ahora extendemos la aplicación con el uso de las siguientes APIs:

* API de geolocalización de W3C. La API estándar de geolocalización disponible en los navegadores web, la cual permite obtener información sobre la ubicación del usuario. Esta API solamente puede utilizarse desde conexiones seguras, o en localhost sin cifrado para desarrollo. Los detalles de esta API los veremos en la clase 5.
* API de plataforma de Google Maps. Usamos esta API para obtener la dirección del usuario según su ubicación geográfica (coordenadas de GPS). También veremos más de esta API en la clase 5.
* API de horóscopo: Usamos una API pública disponible en [https://horoscope-app-api.vercel.app/](https://horoscope-app-api.vercel.app/) que permite acceso al horóscopo. Al igual que Open-Meteo, es posible usar esta API sin autenticación.
* API de traducciones de Google. Usamos esta API para traducir el horóscopo que obtenemos de la API anterior de inglés a español.

En algunos casos, es aceptable acceder a APIs directamente desde el frontend web en el navegador, por ejemplo, cuando se trata de APIs públicas gratuitas y los recursos expuestos por estas APIs son de solo lectura. Pero si se trata de una API que requiere una key por ser comercial, o porque modifica datos en el backend, entonces, estas keys se deben resguardar y no deben por ningún motivo incluirse en el código del frontend (tampoco deben estar guardadas en el repositorio de código).

La práctica utilizada en caso que se requiere utilizar APIs con llaves (keys) es la de encapsular las llamadas a estas APIs en una aplicación de backend. La aplicación de backend puede mantener las keys bajo resguardo, ofrecerle al frontend una fachada con endpoints similares a los de la API, y así, el frontend sólo conversa con el backend sin necesidad de pasar ninguna key.

Para que nuestro backend disponga de keys para acceso a APIs remotas, una práctica común es el uso de variable de entorno. Las variables de entorno se pueden definir en un archivo `.env` en el proyecto, y dicho archivo puede ser cargado por el servidor de backend al momento de iniciarse.

## Descripción de la Aplicación React

Nuestra aplicación React en su segunda iteración ha crecido en funcionalidad. Permite buscar ubicaciones geográficas para realizar seguimiento del clima, y guardar ubicaciones favoritas. Para esto utiliza hooks de React nombrados arriba, `localStorage` y algunos componentes adicionales de MUI.

## Componentes de la Aplicación

La página index, y los componentes App, Home, Weather, Search y SearchResult se mantienen sin cambio en comparación al laboratorio anterior. En esta oportunidad, las novedades son las siguientes:

* 


## Experimenta con el código

1. En el componente `Search` puedes agregar un botón para limpiar el historial de búsqueda, el cual aparezca desplegado únicamente si hay contenido en la lista de resultados guardada en local storage. 
2. También en el componente `Search`, identifica los posibles estados según las variables, define una función reductora con todos los casos (estados) relevantes que hayas podido identificar, y usa un reducer para mantener el estado del componente. Hint: `START_SEARCH`, `SEARCH_SUCCESS`, `SEARCH_ERROR`, `RESET`.

## Anexo: Lo básico de Vite

Usamos Vite (https://vitejs.dev/) como andamiaje para crear nuestra aplicación utilizando React 18. Vite provee una serie de herramientas, por ejemplo, generadores parecidos a los que tiene una aplicación Rails, que permiten crear una aplicación de frontend a partir de cero, y preparar una aplicación para producción.

Si abres el archivo `package.json` verás que hay un objeto con clave `"scripts"` declarado. Este objeto define varias tareas posibles de realizar utilizando Vite, invocándolas con Yarn según nuestras preferencias de ambiente de desarrollo.

Los scripts relevantes son:

* `dev`: Permite levantar la aplicación en modo desarrollo como hemos visto arriba.
* `build`: Prepara la aplicación para ponerla en ambiente de producción.
* `lint`: Ejecuta linters para validar que el código cumpla estándares de codificación, y normas de calidad.
* `preview`: Permite previsualizar la aplicación después que ha sido construida con `build`.

