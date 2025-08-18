# Laboratorio 2: Introducción al desarrollo móvil con React y MUI

En este laboratorio veremos una aplicación de clima construida utilizando lo básico de React y MUI. La aplicación utiliza la API de [Open-Meteo](https://open-meteo.com/) para acceder a información climática. Esta API tiene posibilidad de [uso gratuito](https://open-meteo.com/en/pricing), sin registro de usuario, lo cual es sumamente beneficioso para nuestra experiencia de laboratorio.

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

## Lo básico de Vite

Usamos Vite (https://vitejs.dev/) como andamiaje para crear nuestra aplicación utilizando React 19. Vite provee una serie de herramientas, por ejemplo, generadores parecidos a los que tiene una aplicación Rails, que permiten crear una aplicación de frontend a partir de cero, y preparar una aplicación para producción.

Si abres el archivo `package.json` verás que hay un objeto con clave `"scripts"` declarado. Este objeto define varias tareas posibles de realizar utilizando Vite, invocándolas con Yarn según nuestras preferencias de ambiente de desarrollo.

Los scripts relevantes son:

* `dev`: Permite levantar la aplicación en modo desarrollo como hemos visto arriba.
* `build`: Prepara la aplicación para ponerla en ambiente de producción.
* `lint`: Ejecuta linters para validar que el código cumpla estándares de codificación, y normas de calidad.
* `preview`: Permite previsualizar la aplicación después que ha sido construida con `build`.

## Descripción de la Aplicación React

Nuestra aplicación React en su primera iteración es bastante simple y se limita a llamar a la API de Open-Meteo para realizar un par de consultas. Resuelve las coordenadas GPS de Santiago de Chile usando una API de "Geocoder", y luego, con estas coordenadas, llama a la API de clima utlizando las funciones de una biblioteca llamada Axios ([https://axios-http.com/docs/intro](https://axios-http.com/docs/intro)), para obtener la información del clima actual. Axios permite realizar peticiones XHR a APIs remotas, con funcionalidad similar a la Fetch API estándar que implementan los navegadores web, sin embargo, Axios provee una serie de conveniencias:

* Convierte automáticamente respuestas JSON de la API de backend directamente a objetos Javascript. De otro modo, es necesario llamar a `JSON.parse` en forma manual para convertir respuestas JSON a objetos.
* Simplifica el paso de parámetros a las APIs remotas.
* Ofrece soporte para eventos de carga y descarga cuando se trabaja con archivos.
* Permite cancelar solicitudes en forma simple.
* Permite modificar solicitudes y respuestas utilizando lógica encapsulable (interceptores).
* Simplifica la sintaxis para realizar solicitudes a las APIs.

La aplicación al cargarse realiza las invocaciones con axios a las APIs de OpenWeather y luego el resultado es desplegado en un componente `Weather` que se encuentra inserto en la aplicación.

### Componentes de la Aplicación

**Index**

La página de carga de la aplicación SPA desarrollada con React es `index.html`. En este archivo se declara un elemento raíz de tipo `div` con `id` con valor `root`, y se carga el archivo `main.jsx`. Este último archivo instancia el componente principal de la aplicación llamado `App` (ver `App.jsx`):

```es6
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; // Asegúrate de importar el tema

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
        </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

**Theme de MUI**

Existe un _theme_ de MUI (Material UI) configurado para la aplicación que se encuentra descrito en `src/theme.js`. Es posible variar la tipografía Roboto utilizada en la aplicación, el esquema de colores, y en general alterar todas las propiedades personalizables de los componentes de MUI.

El componente `ThemeProvider` decora `App` con el _theme_ cargado en el propio archivo `main.jsx`.

**BrowserRouter**

Luego, hay un componente `BrowserRouter`, provisto por React, que permite que la aplicación de frontend pueda tener sus propios enlaces (hipervínculos) locales, y procesar los paths que hay en la barra de direcciones del navegador interpretándolos en el contexto local del frontend. Los enlaces permiten acceder a distintos componentes de la aplicación que quedan instanciados por el componente `App`. 

**React.StrictMode**

Finalmente `React.StrictMode` permite comunicar advertencias o errores al desarrollador respecto a prácticas erróneas en el desarrollo de la aplicación, asociadas a potenciales problemas de calidad.

**Componente App**

El archivo `App.jsx` declara el componente principal de la aplicación `App`, junto con componentes que se instancian cuando se está en la ruta raíz `/` (`Home`) y en la ruta `/search` (`Search`). 

El componente `App` maneja una única variable de estado con el hook de _state_, que permite alternar la vista del menú de navegación, haciendo click en el botón que se encuentra en la barra superior (ver `AppBar` y uso de la variable de estado `toggleDrawer`).

El menú de navegación está construido con un componente tipo `List` de React que permite que los ítemes queden enlazados a otros componentes; `Home` y `Search`.

En las líneas finales de `App.jsx` se encuentra el componente `Routes` que en forma análoga a `routes.rb` en el backend de la aplicación Rails, define una lista de rutas que son válidas para la aplicación que se ejecuta en el _frontend_.

**Componente Home**

El componente `Home` incluye algunos componentes de MUI, como el de [`Card`](https://mui.com/material-ui/react-card/) y `CardContent`. Sin embargo, el propósito de `Card` es proveer un área en la cual instanciar el componente `Weather` que realiza las acciones relevantes en nuestra aplicación.

**Componente Weather**

En este componente hay tres variables de estado (hook `useState` de React) relevantes que son instanciadas:

* `weather`: Guarda el objeto con la información meteorológica obtenida desde la API (temperatura actual, mínima y máxima observada, mínima y máxima pronosticada, y etiqueta de ubicación). Inicialmente es `null`, y se actualiza una vez que la petición a la API se completa exitosamente.
* `loading`: Bandera booleana que indica si el componente está en proceso de obtener los datos desde la API. Es `true` al inicio de la carga y vuelve a `false` cuando la petición finaliza (ya sea con éxito o con error). Permite mostrar un spinner o mensaje de `cargando`.
* `error`: Almacena un mensaje de error (`string`) cuando ocurre algún problema en la obtención de los datos. Inicialmente es '' (vacío). Se usa para informar al usuario cuando no se puede mostrar la información del clima.

**Cliente de Open-Meteo**

Las operaciones clientes de Open-Meteo las encapsulamos en un módulo llamado `weatherApi`, ubicado en `src/api/weatherApi.js`. En la función `fetchWeather` al final de este módulo podrás ver cómo se resuelven las coordenadas de una ubicación usando geocoder, y cómo después se obtienen los valores del tiempo para la ubicación.

## Experimenta con el código

1. Puedes partir usando mensajes `console.debug` en el componente `Weather` para desplegar en consola la respuesta que se obtiene al llamar a la API de clima (variable `temps`). También podrías revisar cómo están implementadas las llamadas a la API en `src/api/weatherApi.js`.
2. Luego, en `Weather` puedes modificar la ubicación geográfica, y verificar los resultados.
3. Puedes personalizar el componente `Search` declarado en `App.jsx`. Incorpora un [campo de texto](https://mui.com/material-ui/react-text-field/) para la búsqueda, asócialo a una variable de estado (p.ej., `useState(location)`), y luego, agrega un hook de `useEffect` que vigile `location`, invoque a las APIs de clima (usa `fetchWeather` del módulo `weatherApi`), y despliegue en la consola el resultado de clima (`console.log`) de acuerdo con la ubicación geográfica tipeada en el campo de texto. 
4. Si quieres hacer algo más avanzado aún, puedes crear un componente `SearchResult` que muestre el resultado de la búsqueda de `Search` (poniéndolo como hijo de este último) al existir algún resultado de búsqueda. El componente `Search` lo puedes mover fuera de `App` y lo puedes poner bajo el directorio de `components`.
5. Puedes ajustar los estilos utilizados en la aplicación variando colores en `src/theme.js`.

