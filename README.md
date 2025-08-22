# Laboratorio 3: Uso de hooks con React y manejo de estado local
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

## Marco Teórico: Hooks en React

A partir de React 16, lanzado en 2019, los hooks son funciones especiales que permiten gestionar aspectos clave del ciclo de vida de los componentes funcionales, como el estado, los efectos secundarios, y otros comportamientos, de manera simple y eficiente. "Engancharse" a estas características significa que los hooks te permiten insertar lógica en puntos específicos del ciclo de vida de un componente funcional. 

### Hook useState

El hook `useState` permite agregar estado a un componente funcional en React. Cuando llamas a `useState`, obtienes una pareja de valores: el estado actual y una función que te permite actualizar ese estado. La ventaja de usar `useState` es que React re-renderiza automáticamente el componente cada vez que el estado cambia, asegurando que la interfaz se actualice correctamente.

Ejemplo:

```es6
import React, { useState } from 'react';

function Contador() {
  // Declara una nueva variable de estado, llamada "contador"
  const [contador, setContador] = useState(0);

  return (
    <div>
      <p>Has hecho clic {contador} veces</p>
      <button onClick={() => setContador(contador + 1)}>
        Haz clic
      </button>
    </div>
  );
}

export default Contador;
```

En este ejemplo, `useState(0)` inicializa el estado contador con un valor de 0. Cuando el usuario hace clic en el botón, se llama a `setContador`, lo que incrementa el valor de contador y provoca una re-renderización del componente, actualizando el número de clics mostrados.

### Hook useEffect

El hook `useEffect` se utiliza para manejar efectos secundarios en los componentes de React. Esto incluye tareas como la recuperación de datos, la suscripción a servicios, o la manipulación directa del DOM. `useEffect` se ejecuta después de que el componente se haya renderizado y, por defecto, lo hace después de cada actualización. Sin embargo, también puede configurarse para ejecutarse solo cuando cambian ciertos valores.

```es6
import React, { useState, useEffect } from 'react';

function Contador() {
  const [contador, setContador] = useState(0);

  // Hook useEffect para actualizar el título del documento
  useEffect(() => {
    document.title = `Has hecho clic ${contador} veces`;
  }, [contador]); // Solo vuelve a ejecutarse si cambia "contador"

  return (
    <div>
      <p>Has hecho clic {contador} veces</p>
      <button onClick={() => setContador(contador + 1)}>
        Haz clic
      </button>
    </div>
  );
}

export default Contador;
```

En este caso, el hook `useEffect` se utiliza para actualizar el título de la página cada vez que cambia el valor de contador. El segundo argumento de `useEffect` es un array de dependencias (`[contador]`), que indica que el efecto solo debe ejecutarse cuando contador cambie, optimizando así el rendimiento.

### Hook useReducer

React 18 incluye un hook nativo llamado `useReducer` que permite manejar el estado de un componente de manera más compleja que `useState`. Este hook es ideal cuando el estado de un componente depende de múltiples acciones o cuando el estado es un objeto que requiere cambios basados en una lógica más estructurada por casos. Ejemplo de uso:

```es6
import React, { useReducer } from 'react';

const initialState = { contador: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'incrementar':
      return { contador: state.contador + 1 };
    case 'decrementar':
      return { contador: state.contador - 1 };
    default:
      throw new Error('Acción no soportada');
  }
}

function Contador() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Contador: {state.contador}</p>
      <button onClick={() => dispatch({ type: 'incrementar' })}>
        Incrementar
      </button>
      <button onClick={() => dispatch({ type: 'decrementar' })}>
        Decrementar
      </button>
    </div>
  );
}

export default Contador;
```

La constante `initialState` define el estado inicial del componente, en este caso, un objeto con una propiedad contador inicializada en 0.

Luego, `reducer` es una función que toma _el estado actual y una acción_ como argumentos, y devuelve un nuevo estado basado en el tipo de acción. Aquí, el reducer maneja dos tipos de acciones: incrementar y decrementar.

El hook `useReducer` se usa para crear el estado y el método `dispatch`, que se utiliza para enviar acciones al reducer. Este hook recibe el reducer y el estado inicial como argumentos.

La función `dispatch` se utiliza para enviar acciones al reducer. Cuando se hace clic en los botones, se envían acciones con los tipos incrementar o decrementar, lo que provoca que el estado se actualice de acuerdo con la lógica definida en el reducer.

Este ejemplo es de juguete, pero a medida que las aplicaciones y los componentes se van haciendo más complejos en términos del estado que deben manejar, el uso de reducers hace que el código se vuelva más fácil de mantener y depurar. Con reducers todas las actualizaciones a una variable de estado pasan por definir todos los casos posibles de modificación de estado y cubrir correctamente esos casos.

### Bibliotecas de Hooks: Caso de Axios

Además de los hooks nativos, existen bibliotecas de terceros que extienden la funcionalidad de React ofreciendo hooks personalizados que facilitan tareas comunes. Por ejemplo, `axios-hooks` es una biblioteca que proporciona hooks específicos para hacer solicitudes HTTP con Axios en React. Este hook simplifica la lógica de recuperación de datos y manejo de estados de carga o error en componentes funcionales. Ejemplo:

```es6
import React from 'react';
import useAxios from 'axios-hooks';

function ListaUsuarios() {
  const [{ data, loading, error }] = useAxios('https://api.example.com/users');

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error al cargar los datos.</p>;

  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

export default ListaUsuarios;
```

En este ejemplo, `useAxios` gestiona automáticamente los estados de carga (`loading`) y error (`error`). Así, los desarrolladores pueden enfocarse en la lógica de presentación sin preocuparse por las complejidades de la solicitud HTTP.

Para instalar `axios-hooks` en un proyecto usando Yarn, basta ejecutar:

```sh
yarn add axios-hooks
```

En este proyecto, el módulo ya está incorporado en `package.json`.

### Uso de Local Storage con Hooks

Hemos visto en clases, y en la lectura del libro The Road to React, la existencia y el uso de la API de _Local Storage_, la cual está disponible en [sobre el 90%](https://caniuse.com/?search=localstorage) de los dispositivos móviles actuales. Para utilizar _Local Storage_ con React, es recomendable hacerlo a través de un módulo que provee un hook para ello, llamado  
`use-local-storage-state`, el cual puede ser instalado en un proyecto con:

```sh
yarn add use-local-storage-state
```

Ejemplo de uso:

```es6
import React from 'react';
import useLocalStorageState from 'use-local-storage-state';

function ContadorConLocalStorage() {
  const [contador, setContador] = useLocalStorageState('contador', 0);

  return (
    <div>
      <p>Contador: {contador}</p>
      <button onClick={() => setContador(contador + 1)}>
        Incrementar
      </button>
      <button onClick={() => setContador(0)}>
        Reiniciar
      </button>
    </div>
  );
}

export default ContadorConLocalStorage;
```

El hook `useLocalStorageState` se utiliza en lugar de `useState` para crear una variable de estado que se sincroniza automáticamente con `localStorage`. Al pasar la clave `contador` como primer argumento, el valor de contador se almacena en `localStorage` bajo esa clave.

Cada vez que se actualiza el valor de `contador`, también se actualiza el valor almacenado en `localStorage`. Si el usuario recarga la página o vuelve a ella más tarde, el contador comenzará desde el valor que estaba en `localStorage` en lugar de resetearse.

Es importante notar que las claves guardadas en `localStorage` pueden colisionar entre aplicaciones distintas si no se toman precauciones. Por ejemplo, la clave `contador` es demasiado genérica y perfectamente podría ser utilizada en diferentes aplicaciones, con efectos no deseados, e incluso dañinos. Hay buenas prácticas para prevenir esto:

Uso de prefijos en las claves: Usar prefijos únicos para las claves en `localStorage` es una de las prácticas más comunes. Esto asegura que las claves sean únicas dentro del ámbito de tu aplicación, incluso si se usan nombres genéricos como `contador`. El prefijo podría incluir el nombre de la aplicación, el módulo, o alguna otra identificación única.

Ejemplo:

```es6
const [contador, setContador] = useLocalStorageState('miApp-contador', 0);
```

En este caso, `miApp-contador` se utiliza como clave en `localStorage`, lo que reduce el riesgo de colisiones con otras aplicaciones.

Uso de espacios de nombre (namespaces): Otra buena práctica es utilizar espacios de nombres o nombres jerárquicos. Esto es útil si tienes múltiples módulos o funcionalidades que necesitan almacenar datos en `localStorage`. Puedes estructurar las claves de manera jerárquica para organizar mejor los datos. Ejemplo:

```es6
const [contador, setContador] = useLocalStorageState('miApp/moduloA/contador', 0);
```

Este esquema de clave `miApp/moduloA/contador` asegura que la clave es específica a un módulo dentro de la aplicación, minimizando las posibilidades de colisión.

Uso de identificadores únicos: En algunos casos, podrías querer incluir identificadores únicos, como el ID de un usuario o el identificador de una sesión, en las claves. Esto es útil en aplicaciones que manejan múltiples usuarios o sesiones simultáneas. Ejemplo:

```es6
const userId = 'user123';
const [contador, setContador] = useLocalStorageState(`miApp/${userId}/contador`, 0);
```

Aquí, la clave `miApp/user123/contador` asegura que el estado es específico al usuario actual.

Es importante mantener una convención clara y consistente para nombrar las claves en `localStorage` a lo largo de la aplicación. Documentar estas convenciones ayudará a todos los desarrolladores en el equipo a seguir las mismas prácticas, reduciendo aún más la posibilidad de errores.

Por último, implementar validaciones y manejo de errores al interactuar con `localStorage` es una buena práctica para manejar situaciones inesperadas, como la falta de espacio o acceso denegado. También es recomendable comprobar que los valores obtenidos desde localStorage tienen el formato esperado.

```es6
const storedValue = localStorage.getItem('miApp-contador');
const contador = storedValue ? JSON.parse(storedValue) : 0;
```

## Descripción de la Aplicación React

Nuestra aplicación React en su segunda iteración ha crecido en funcionalidad. Permite buscar ubicaciones geográficas para realizar seguimiento del clima, y guardar ubicaciones favoritas. Para esto utiliza hooks de React nombrados arriba, `localStorage` y algunos componentes adicionales de MUI.

## Componentes de la Aplicación

### Index

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

### Theme de MUI

Existe un _theme_ de MUI (Material UI) configurado para la aplicación que se encuentra descrito en `src/theme.js`. Es posible variar la tipografía Roboto utilizada en la aplicación, el esquema de colores, y en general alterar todas las propiedades personalizables de los componentes de MUI.

El componente `ThemeProvider` decora `App` con el _theme_ cargado en el propio archivo `main.jsx`.

### BrowserRouter

Luego, hay un componente `BrowserRouter`, provisto por React, que permite que la aplicación de frontend pueda tener sus propios enlaces (hipervínculos) locales, y procesar los paths que hay en la barra de direcciones del navegador interpretándolos en el contexto local del frontend. Los enlaces permiten acceder a distintos componentes de la aplicación que quedan instanciados por el componente `App`. 

### React.StrictMode

Finalmente `React.StrictMode` permite comunicar advertencias o errores al desarrollador respecto a prácticas erróneas en el desarrollo de la aplicación, asociadas a potenciales problemas de calidad.

### Componente App

El archivo `App.jsx` define el componente principal de la aplicación `App`.
Este componente declara la barra superior (`AppBar`), el menú de navegación lateral, y gestiona las rutas disponibles.

* Mantiene una variable de estado con el hook `useState` (`toggleDrawer`) para abrir/cerrar el menú lateral.
* Usa un componente `List` de MUI para organizar los ítems del menú, enlazando cada uno con vistas como `Home` o `Search`.
* En la parte final, el componente `Routes` asocia rutas (`/`, `/search`) con sus respectivos componentes (`Home`, `Search`). Esto funciona de forma similar al archivo `routes.rb` en Rails, pero en el *frontend*.

### Componente Home

El componente `Home` corresponde a la ruta raíz `/`.
Su estructura se basa en componentes de MUI como [`Card`](https://mui.com/material-ui/react-card/) y `CardContent`.

* El propósito de la tarjeta es contener el componente `Weather`.
* `Home` funciona como una interfaz visual que muestra el clima actual usando `Weather`, dándole un formato consistente con MUI.

### Componente Search

El componente `Search` corresponde a la ruta `/search` y es uno de los más interactivos de la aplicación.
Su propósito es que el usuario busque ciudades y reciba como resultado tarjetas con información climática de cada ubicación.

#### Hooks y estado

`Search` utiliza varios hooks de React para gestionar el estado interno:

* **`inputValue`** (`useState`)
  Contiene el texto actual que el usuario ha escrito en el campo de búsqueda.

* **`query`** (`useState`)
  Variable que se establece cuando el usuario confirma la búsqueda (al presionar el botón o Enter). Es la que dispara la consulta real a la API.

* **`results`** (`useState`)
  Arreglo con los resultados de la búsqueda. Cada resultado tiene la forma `{ location, temps }`, donde:

  * `location` es un objeto con información de la ciudad (nombre, país, coordenadas, etc.).
  * `temps` son los datos de clima obtenidos desde la API.

* **`loading`** (`useState`)
  Bandera que indica si la búsqueda está en curso, permitiendo mostrar un estado de “Buscando…” en el botón.

* **`error`** (`useState`)
  Contiene mensajes de error que se muestran al usuario si la búsqueda falla o no se encuentran ubicaciones.

* **`keywordList`** (`useLocalStorageState`)
  Historial de términos de búsqueda almacenado en el `localStorage`.
  Se inicializa como un arreglo vacío (`defaultValue: []`) y permite que el usuario tenga sugerencias basadas en búsquedas anteriores.

#### Lógica principal

El hook **`useEffect`** escucha cambios en `query`. Cada vez que esta variable cambia:

1. Se limpia el estado (`results` vacío, `error` vacío, `loading` en `true`).
2. Se llama a la función asíncrona `fetchWeatherMulti(query)` para obtener resultados múltiples desde la API.
3. Si se reciben resultados, se actualiza `results` y se agrega `query` a `keywordList` si no estaba presente.
4. Si no hay resultados, se establece un mensaje de error.
5. Al terminar, `loading` vuelve a `false`.

La función **`handleSearch`** es la encargada de tomar el texto en `inputValue`, validarlo, y actualizar `query`.
Si el campo está vacío, se muestra un error y se limpia el estado de resultados.

#### Interfaz de usuario

El componente `Search` usa varios elementos de MUI:

* **`Autocomplete`**
  Permite al usuario escribir libremente (`freeSolo`) y muestra sugerencias basadas en el historial `keywordList`.
  El valor escrito se sincroniza con `inputValue`. Al presionar Enter, se dispara la búsqueda.

* **`TextField`**
  Campo de texto integrado al `Autocomplete`. Tiene una etiqueta explicativa que da ejemplos de formato:
  `"Santiago, CL"` o `"Columbus, OH, US"`.

* **`Button`**
  Ejecuta `handleSearch` al hacer click. Muestra el ícono `SearchIcon` y cambia su texto dinámicamente entre *Buscar* y *Buscando...* según el estado `loading`.

* **Mensajes de error**
  Cuando la búsqueda falla, se muestra un texto en rojo bajo el campo de búsqueda.

* **Resultados (`SearchResult`)**
  Se renderiza un `Grid` (usando un `Box` con `display: grid`) donde cada elemento es un componente `SearchResult`.
  Cada `SearchResult` recibe:

  * `label`: nombre formateado de la ubicación (incluye país y región si aplica).
  * `location` y `temps`: datos que mostrarán la información climática.
  * `isFavorite` y `onAddFavorite`: funciones para gestionar favoritos.

* **Nota de ordenamiento**
  Si hay resultados, al final se muestra un texto aclarando que los resultados están ordenados por población descendente.

#### Props

El componente recibe dos propiedades (`props`):

* **`isFavorite(location)`**: función que indica si una ubicación ya está marcada como favorita.
* **`onAddFavorite(location)`**: función que permite agregar una ubicación a favoritos.

Ambas son requeridas y están tipadas con `PropTypes`.

### Componente SearchResult

El componente `SearchResult` recibe como propiedades (`props`) los datos de una ubicación obtenida en la búsqueda.
Su función es presentar cada resultado en un formato de tarjeta (`Card` de MUI).

* Muestra información clave como nombre de la ubicación y coordenadas.
* Incorpora un botón o acción para agregar esa ubicación como favorita, lo que podría reflejarse luego en la vista `Home`.

### Componente Weather

El componente `Weather` es el encargado de conectarse a la API del clima y mostrar la información.

Hooks utilizados:

* **useState**: mantiene la variable `weather` con los datos recibidos.
* **useEffect**: ejecuta automáticamente una vez tras el renderizado. Dentro llama a `fetchWeather` (función asíncrona), que realiza la petición a la API remota y actualiza el estado con los resultados.

De esta forma, `Weather` muestra en pantalla el estado actual del clima obtenido dinámicamente desde la API.

### Cliente de la API de Open-Meteo (`weatherApi.js`)

Este módulo implementa la lógica para interactuar con los servicios públicos de [Open-Meteo](https://open-meteo.com/). Contiene funciones de **geocodificación** (búsqueda de ciudades) y de **clima** (estado actual y pronóstico). Su diseño abstrae la complejidad de las llamadas a la API y entrega a los componentes datos ya procesados y listos para usar.

#### Función `norm(s)`

* **Propósito:**
  Normaliza cadenas de texto para comparaciones seguras.
  Convierte a minúsculas, quita acentos/diacríticos y elimina espacios sobrantes.
* **Uso:**
  Facilita comparar nombres de regiones (`admin1`) aunque estén escritos con o sin acentos.

#### Función `buildGeocodeParams(input)`

* **Entrada:**
  Un string del tipo `"Ciudad[, Región][, CC]"`. Ejemplos:

  * `"Santiago, CL"`
  * `"Columbus, OH, US"`

* **Comportamiento:**

  1. Separa el input por comas.
  2. Identifica:

     * **city:** nombre de la ciudad (puede enriquecerse con la región para evitar ambigüedad).
     * **admin:** subdivisión administrativa (`admin1`) si se entrega.
     * **cc:** código de país ISO-3166 (2 letras).
  3. Construye un objeto `params` con opciones para el servicio de geocodificación de Open-Meteo:

     * `name` → nombre de la ciudad (con `admin` si corresponde).
     * `count: 10` → máximo de 10 resultados.
     * `language: 'es'` → resultados en español.
     * `format: 'json'`.
     * `countryCode` (si se detecta `cc`).

* **Salida:**
  `{ params, adminRaw, cc }`

#### Función `geocodeMany(input)`

* **Propósito:**
  Llama a la API de geocodificación de Open-Meteo (`/v1/search`) para obtener posibles coincidencias de una ciudad.

* **Flujo principal:**

  1. **Primer intento:** usar `buildGeocodeParams`.
  2. **Fallback:** si no hay resultados, reintenta con solo la primera parte del input.
  3. **Filtro opcional:** si el usuario entregó `admin`, filtra resultados donde `admin1` coincida.
  4. **Ordenamiento:** ordena los resultados por población descendente (heurístico: prioriza ciudades grandes).
  5. **Normalización:** devuelve un arreglo con un formato estable para cada ciudad:

     * `id`, `name`, `admin1`, `country`, `country_code`, `latitude`, `longitude`, `population`, `timezone`.

* **Salida:**
  Array de objetos de ubicación listos para usar en la consulta de clima.
 
#### Función `fetchWeatherForLocation({ latitude, longitude, timezone })`

* **Propósito:**
  Llama a la API de pronóstico de Open-Meteo (`/v1/forecast`) para obtener:

  * Temperatura actual.
  * Humedad relativa actual.
  * Velocidad del viento actual.
  * Mínimas y máximas pronosticadas para hoy.
  * Mínimas y máximas **observadas** hasta el momento en el día.

* **Parámetros enviados:**

  * `latitude`, `longitude`, `timezone`.
  * Variables solicitadas:

    * `current: temperature_2m, relative_humidity_2m, wind_speed_10m`
    * `hourly: temperature_2m`
    * `daily: temperature_2m_min, temperature_2m_max`

* **Lógica adicional:**

  * Calcula `obsMin` y `obsMax` a partir de las temperaturas horarias disponibles hasta la hora actual del día.
  * Redondea valores numéricos a un decimal o enteros según corresponda.

* **Salida:**
  Objeto con las claves:
  `{ temp, humidity, wind, tempMinObserved, tempMaxObserved, tempMinForecast, tempMaxForecast }`

#### Función `fetchWeatherMulti(query)`

* **Propósito:**
  Función pública que implementa la búsqueda de clima para múltiples ciudades.

* **Flujo:**

  1. Llama a `geocodeMany(query)` para obtener hasta 10 ubicaciones candidatas.
  2. Ejecuta `fetchWeatherForLocation` en paralelo para cada ubicación.
  3. Fusiona cada ubicación con sus datos climáticos (`{ location, temps }`).
  4. Filtra las ubicaciones que no devolvieron clima válido.
  5. Devuelve los resultados en un arreglo, ya ordenados por población.

* **Salida:**
  Array de objetos:

  ```js
  [
    { location: { ... }, temps: { ... } },
    ...
  ]
  ```

#### Función `fetchWeather(singleQuery)` (compatibilidad)

* **Propósito:**
  Versión simplificada para obtener el clima de una sola ubicación.
  Internamente llama a `fetchWeatherMulti` y devuelve solo el primer resultado.

* **Uso:**
  Se mantiene para compatibilidad con código anterior.

#### Resumen

Este cliente cumple tres objetivos principales:

1. **Interpretar entradas ambiguas** (`buildGeocodeParams`) y consultar la API de geocodificación de Open-Meteo (`geocodeMany`).
2. **Consultar datos de clima detallados** para coordenadas específicas (`fetchWeatherForLocation`).
3. **Proveer una API unificada** al resto de la aplicación (`fetchWeatherMulti`) que entrega resultados enriquecidos y listos para renderizar.

Gracias a este diseño, los componentes de React (`Weather`, `Search`, `SearchResult`) no necesitan preocuparse por los detalles de las llamadas HTTP ni por cómo combinar datos de ubicación y clima.

## Experimenta con el código

1. En el componente `Search` puedes agregar un botón para limpiar el historial de búsqueda, el cual aparezca desplegado únicamente si hay contenido en la lista de resultados guardada en local storage.
2. 

## Anexo: Lo básico de Vite

Usamos Vite (https://vitejs.dev/) como andamiaje para crear nuestra aplicación utilizando React 18. Vite provee una serie de herramientas, por ejemplo, generadores parecidos a los que tiene una aplicación Rails, que permiten crear una aplicación de frontend a partir de cero, y preparar una aplicación para producción.

Si abres el archivo `package.json` verás que hay un objeto con clave `"scripts"` declarado. Este objeto define varias tareas posibles de realizar utilizando Vite, invocándolas con Yarn según nuestras preferencias de ambiente de desarrollo.

Los scripts relevantes son:

* `dev`: Permite levantar la aplicación en modo desarrollo como hemos visto arriba.
* `build`: Prepara la aplicación para ponerla en ambiente de producción.
* `lint`: Ejecuta linters para validar que el código cumpla estándares de codificación, y normas de calidad.
* `preview`: Permite previsualizar la aplicación después que ha sido construida con `build`.

