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

