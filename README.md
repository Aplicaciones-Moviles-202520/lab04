# Laboratorio 4: Formularios, validaciones, e introducción a APIs de georeferenciación

En este laboratorio continuaremos desarrollando la aplicación de clima con React y MUI. La aplicación utiliza la API de [Open-Meteo](https://open-meteo.com/) para acceder a información climática.

## Pasos iniciales

En Google Cloud Platform (GCP; https://cloud.google.com) activa tu cuenta de desarrollador utilizando tus credenciales de `miuandes`. La plataforma te da un saldo de 300 USD para probar distintas APIs. No obstante esto, debes proveer un número de tarjeta de crédito para utilizar la plataforma. Nuestra recomendación es obtener una tarjeta de crédito de prepago en MACH de BCI, o en TENPO. Si no utilizas una cuenta en Google Cloud Platform, igualmente podrás correr las aplicaciones de frontend y backend de este laboratorio, pero con algunas limitaciones. En particular, no podrás utilizar los servicios de georeferenciación ni traducción de Google.

Una vez dentro de la plataforma GCP, crea un proyecto, asígnale nombre "icc4203-lab5". Luego, en el proyecto debes buscar y habilitar las siguientes APIs:

* Geocoding API
* Cloud Translation API

En la sección "Credentials" de la navegación podrás crear tus propias API keys para usar las dos APIs. Incluso podrías crear una sola API key y utilizarla con ambos servicios. Puedes crear la key para uso sin restricciones, o restringir por servicios (los dos nombrados anteriormente).

Una vez que cuentes con las APIs de Google necesarias, puedes instalar todas las dependencias del proyecto actual (asegúrate de contar con [NVM](https://github.com/nvm-sh/nvm) y Node 24, activando Yarn con el comando `corepack enable`):

```sh
yarn install
```

Esto instalará todos los paquetes o módulos especificados en el archivo `package.json` que requiere la aplicación. Preferimos utilizar Yarn para gestión de módulos y dependencias de Javascript.

Luego, copia el archivo `.env.example` a `.env`. Rellena el archivo `.env` con las keys de GCP que hayas generado para utilizar las APIs:

```sh
GOOGLE_GEOCODING_API_KEY=api_key_para_geocoding
GOOGLE_TRANSLATE_API_KEY=api_key_para_traducción
```

Finalmente, la aplicación estará lista para ejecxutar:

```sh
yarn dev
```

El comando anterior ejecuta la aplicación en modo de desarrollo. Puedes abrir el navegador web en [http://localhost:5173/](http://localhost:5173/) para ver el funcionamiento.

## Marco Teórico

### Formularios en React con Formik

Vimos en la clase 4 que la implementación de formularios en React puede verse facilitada utilizando la librería [Formik](https://formik.org/docs/overview). Formik es una de las librerías más utilizadas en el ecosistema de React para manejar formularios. Trabajar con formularios en React puede ser tedioso porque hay que manejar manualmente el estado de cada input (useState), escribir funciones para validar campos y mostrar errores, implementar la lógica de submit (qué hacer con los datos), y controlar cuándo mostrar mensajes de error (al escribir, al salir del campo, al enviar).

Formik abstrae toda esta lógica repetitiva y ofrece un marco coherente para manejar formularios complejos de forma más declarativa, estructurada y menos propensa a errores.

Las principales características de Formik son las siguientes:

* Manejo automático de estado de formulario
  * Centraliza los valores de todos los inputs en un objeto (values).
  * Controla cambios con `handleChange` y `handleBlur`.
* Validación integrada
  * Soporta validación síncrona y asíncrona.
  * Se integra de forma natural con librerías como Yup para definir esquemas de validación declarativos.
* Manejo de errores y touched
  * Proporciona objetos (`errors`, `touched`) para saber qué campos tienen errores y cuándo mostrarlos.
* Manejo de envío (submit)
  * Proporciona un `handleSubmit` que centraliza la lógica al enviar el formulario.
  * Maneja estados como `isSubmitting` para bloquear botones mientras se procesa.
* Componentes y hooks listos
  * `Formik` y `Form` para estructurar formularios.
  * `Field` y `ErrorMessage` para inputs y errores.
  * `useFormik` hook para control granular en componentes funcionales.
* Escalabilidad
  * Facilita trabajar desde formularios simples con un par de inputs hasta formularios grandes y dinámicos con secciones condicionales.

### Validaciones con Yup

En formularios (o en cualquier parte de una aplicación) es común tener que validar datos. Sin una librería, habría que escribir funciones manuales para cada campo, repitiendo lógica como "el nombre no puede estar vacío", "el email debe tener formato válido", y "la fecha debe ser anterior a hoy". Esto genera mucho código repetitivo, difícil de mantener y propenso a inconsistencias.

[Yup](https://github.com/jquense/yup?tab=readme-ov-file) resuelve este problema ofreciendo una forma declarativa y centralizada de definir reglas de validación como esquemas.

Las principales funciones de Yup son las siguientes:

* Esquemas declarativos
  * Permite describir la forma de un objeto de datos (shape) y sus reglas de validación.
  * Ejemplo: `yup.object({ email: yup.string().email().required() })`.
* Validación poderosa y expresiva
  * Tipos primitivos soportados: `string`, `number`, `boolean`, `date`, `array`, `object`.
  * Métodos encadenables (`.required()`, `.min()`, `.max()`, `.matches()`, etc.).
  * Validación condicional con `.when()`.
* Mensajes de error personalizables
  * Cada regla puede tener su propio mensaje de error.
* Validación síncrona y asíncrona
  * Puede validar en tiempo real o contra APIs externas.
  * Métodos: `.validate()` (lanza excepción si falla), `.isValid()` (booleano).
* Integración con otras librerías
  * Se usa muchísimo junto a Formik: defines el validationSchema con Yup y Formik se encarga de aplicarlo automáticamente.
  * También se puede usar en Node.js o backend para validar datos de entrada.
* Transformaciones de datos
  * Puede sanitizar entradas (ejemplo: `trim()` en strings).
  * Define valores por defecto con `.default()`.

### Uso de APIs remotas

En los laboratorios anteriores utilizamos la API de Open-Meteo para consultar información climática en distintas ubicaciones geográficas. En esta etapa ampliaremos nuestra aplicación incorporando el uso de las siguientes APIs:

* API de geolocalización de W3C: se trata de la API estándar de geolocalización disponible en los navegadores web. Permite obtener la ubicación del usuario y solo puede emplearse en conexiones seguras (HTTPS) o, para fines de desarrollo, en localhost sin cifrado. Revisaremos sus detalles en la clase 5.
* Google Maps Platform: la utilizaremos para realizar reverse geocoding, es decir, obtener la dirección del usuario a partir de sus coordenadas de GPS. También profundizaremos en esta API en la clase 5.
* API de horóscopo: haremos uso de una API pública disponible en [https://horoscope-app-api.vercel.app/](https://horoscope-app-api.vercel.app/) que nos entrega información de horóscopos.
* API de traducción de Google: la emplearemos para traducir al español el horóscopo obtenido en inglés desde la API anterior.

En ciertos escenarios es aceptable acceder directamente a las APIs desde el frontend en el navegador, por ejemplo, cuando se trata de APIs públicas gratuitas que ofrecen datos de solo lectura. Sin embargo, en el caso de APIs comerciales, o de aquellas que permiten modificar datos, el acceso debe manejarse con precaución: las claves (API keys) nunca deben exponerse en el código del frontend ni almacenarse en el repositorio.

La práctica recomendada en estos casos es encapsular las llamadas a APIs protegidas en un backend. En el presente laboratorio, el backend se encuentra en `server/index.js`. Se trata una pequeña aplicación web implementada con el microframework [Express](https://expressjs.com/) para Node (equivalente en funcionalidad a Rails en modo API, o a otros frameworks como Sinatra, FastAPI, o Flask). El backend puede mantener las claves bajo resguardo y ofrecer al frontend una fachada con endpoints propios, de modo que el cliente interactúe únicamente con el backend y nunca tenga acceso directo a las keys. **En el proyecto del curso, cuando tengan que trabajar con APIs remotas, tienen que implementar el mismo enfoque; añadir controladores y rutas a su aplicación Rails que hagan reenvío de las peticiones del frontend a las APIs remotas (de Google u otros proveedores), manteniendo las credenciales (API keys) resguardadas y sin exponerlas al frontend.**

Para que el backend disponga de las claves (API keys) de forma segura, es habitual almacenarlas como [variables de entorno](https://chatgpt.com/share/68b70ce0-5278-800b-b99f-d95e99a31e43). Estas se definen en un archivo `.env` dentro del proyecto, que luego es cargado por el servidor al momento de iniciar. Reiteramos lo mencionado arriba: no es recomendable ni seguro mantener el archivo `.env` con las API keys en el repositorio junto con el resto del código. De hecho, los archivos `.env` se deben mantener en `.gitignore`. En cambio, sí es deseable mantener un archivo de ejemplo `.env.example`, que incluya solamente las variables de entorno sin los valores, a fin de que pueda saberse qué variables de entorno son requeridas por la aplicación. Es el caso en esta aplicación; se incluye un archivo `.env.example`, del cual se puede crear una copia `.env` y llenarla con las API keys necesarias.

Finalmente, es una buena práctica crear módulos en el frontend que encapsulen la funcionalidad de clientes de las APIs. En la presente aplicación estos clientes se encuentran en `src/api` y los hay para la API de geocoder de Google (`geocodeClient.js`), API de horóscopo (`horoscopeClient.js`), API de traducción (`translateClient.js`) y API de clima (`weatherApi.jsp`). Estos módulos luego pueden ser incluidos y utilizados desde componentes de React.

## Descripción de la Aplicación React

Nuestra aplicación React en su tercera iteración ha crecido en funcionalidad. Permite crear un perfil de usuario (formulario con validaciones), iuncluyendo la funcionalidad básica de georeferenciación para buscar la dirección actual del usuario. Además, en la solución (rama `solution`) podrás ver la implementación de un componente de horóscopo.

## Componentes de la Aplicación

La página index, y los componentes `App`, `Home`, `Weather`, `Search` y `SearchResult` se mantienen sin cambio en comparación al laboratorio anterior. En esta oportunidad, las novedades son las siguientes:

* Componente `UserProfile` que implementa un perfil de usuario básico, con formulario Formik y validaciones con Yup. En la rama `solution` podrás ver el formulario más completo con un campo de fecha de nacimiento en vez de un campo de texto para ingresar la edad. Además, la edad en la rama `solution` se mantiene, pero se actualiza cada vez que cambia la fecha de nacimiento.
* Se ha incorporado un cliente de API de Google Maps (`src/api/geocodeClient.js`) que permite usar el servicio de geocoder de Google. Esto es utilizado por el componente `UserProfile`, a fin de poder determinar la dirección del usuario e incorporarla en su perfil. Además, `UserProfile` utiliza la api de georeferenciación estándar para obtener las coordenadas del usuario.
* Componente `Horoscope` que implementa una vista de horóscopo en función del signo que tenga el usuario, dado por su fecha de nacimiento. El horóscopo es obtenido desde la API pública antes mencionada, y traducido a español utilizando la API de traducción de Google. Este componente utiliza dos clientes de API, `src/api/horoscopeClient.js` y `src/api/translateClient.js`.
* Servidor de backend para encapsular llamadas a las APIs de geolocalización (geocoder) y traducción de Google, junto con la API de horóscopo. En `server/index.js` verás el servidor de backend implementado con Express, el cual contiene endpoints que encapsulan las llamadas a la API de traducción de Google y a la API de horóscopo. Podrás ver en el servidor cómo éste carga las API keys desde el archivo `.env` con variables de entorno. 
* El archivo `package.json` en la raíz del proyecto ha sido actualizado con scripts `dev:api`, el cual lanza el servidor de backend (puerto 5174), `dev:web`, el cual lanza el frontend (puerto 5173), y `dev` que lanza ambas aplicaciones en forma concurrente - usa un módulo llamado `concurrent` para lograr esto.
* En el archivo `vite.config.js` se define una configuración para mapear todas las rutas `/api` en el frontend al backend.

## Experimenta con el código

1. Trabaja en la rama `main` completando el componente `UserProfile` con un campo que permita registrar la fecha de nacimiento. El usuario debe ser mayor de 13 años de edad (de lo contrario se debe desplegar error). Mantén la edad del usuario (`age`) sincronizada con su fecha de nacimiento. Muestra la fecha junto con la edad en la vista de `UserProfile`. Revisa la rama `solution` para ver el resultado deseado. El componente de MUI que debes utilizar es [`DatePicker`](https://mui.com/x/react-date-pickers/date-picker/). Para trabajar con fechas en formato `DD-MM-YYYY` puedes envolver `DatePicker` dentro de `LocalizationProvider`, con las siguientes props:
```
dateAdapter={AdapterDateFns} adapterLocale={es}
```
Lo anterior funciona porque `AdapterDateFns` es provisto por `@mui/x-date-pickers/AdapterDateFns`, y `es` está incluido desde `date-fns/locale`.
2. Implementa el componente `Horoscope` utilizando el cliente de API de horóscopo en `src/api/horoscopeClient.js`, y el cliente de la API de traducción de Google, `src/api/translateClient.js`. También encontrarás la implementación completa de esto en la rama `solution`.

## Anexo: Lo básico de Vite

Usamos Vite (https://vitejs.dev/) como andamiaje para crear nuestra aplicación utilizando React 18. Vite provee una serie de herramientas, por ejemplo, generadores parecidos a los que tiene una aplicación Rails, que permiten crear una aplicación de frontend a partir de cero, y preparar una aplicación para producción.

Si abres el archivo `package.json` verás que hay un objeto con clave `"scripts"` declarado. Este objeto define varias tareas posibles de realizar utilizando Vite, invocándolas con Yarn según nuestras preferencias de ambiente de desarrollo.

Los scripts relevantes son:

* `dev`: Permite levantar la aplicación en modo desarrollo como hemos visto arriba.
* `build`: Prepara la aplicación para ponerla en ambiente de producción.
* `lint`: Ejecuta linters para validar que el código cumpla estándares de codificación, y normas de calidad.
* `preview`: Permite previsualizar la aplicación después que ha sido construida con `build`.

