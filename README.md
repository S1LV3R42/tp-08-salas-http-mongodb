# Trabajo Práctico 08: Endpoints persistentes de reservas de salas

Aplicación Node.js con Express 5 y Mongoose que gestiona reservas de salas. Los datos se almacenan en MongoDB Atlas (tier gratuito M0) y se exponen mediante una API JSON y una interfaz web renderizada con EJS. Todas las operaciones sobre los datos son asíncronas (`async/await`).

## 1. Descripción general

El proyecto es la evolución del TP 07. La versión anterior mantenía los datos en un arreglo en memoria cargado al iniciar el servidor. En esta versión la información persiste en la nube: cada reserva creada sobrevive a los reinicios del proceso Node.js.

El sistema ofrece dos superficies de acceso que comparten un único servicio de negocio:

- Una API JSON bajo el prefijo `/api`.
- Un conjunto de vistas HTML bajo la raíz `/`.

## 2. Evolución respecto del TP 07

- Se eliminó la semilla de datos en memoria. El servicio lee y escribe directamente en MongoDB mediante promesas de Mongoose.
- El enrutamiento se separó en dos archivos: `rutas/api.js` para los endpoints JSON y `rutas/html.js` para las vistas EJS.
- Se incorporó un middleware global de errores con cuatro parámetros, que responde en JSON o en HTML según la ruta solicitada.
- Se agregó la propiedad `estado` al modelo, con valor inicial `pendiente`. El cliente no puede asignarla al crear una reserva.
- El identificador expuesto a la red es `id` (texto), en lugar de `_id`.

## 3. Stack tecnológico

| Componente | Versión | Función |
| :--- | :--- | :--- |
| Node.js | LTS reciente | Entorno de ejecución |
| express | 5 (`^5.0.0`) | Servidor HTTP y manejo nativo de errores asíncronos |
| mongoose | 8 (`^8.0.0`) | Modelado y acceso a MongoDB |
| ejs | `^3.1.10` | Motor de plantillas |
| express-ejs-layouts | `^2.5.1` | Layout común para las vistas |
| morgan | `^1.10.0` | Registro de peticiones HTTP |
| dotenv | `^16.4.5` | Carga de variables de entorno |
| prettier, eslint, @eslint/js | `^3.3.3`, `^9.12.0`, `^9.12.0` | Formato y análisis estático (dependencias de desarrollo) |

Express 5 permite que los controladores asíncronos propaguen errores sin necesidad de librerías adicionales como `express-async-errors`.

## 4. Estructura del proyecto

```
tp-08-salas-http-mongodb/
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── public/
│   └── css/estilos.css
├── views/
│   ├── inicio.ejs
│   ├── no-encontrado.ejs
│   ├── layouts/main.ejs
│   ├── partials/
│   │   ├── encabezado.ejs
│   │   └── pie.ejs
│   └── reservas/
│       ├── detalle.ejs
│       ├── lista.ejs
│       └── nueva.ejs
└── src/
    ├── app.js
    ├── index.js
    ├── config/
    │   ├── base-datos.js
    │   └── entorno.js
    ├── middleware/
    │   └── errores.js
    ├── modelos/
    │   └── reserva.js
    ├── rutas/
    │   ├── api.js
    │   └── html.js
    └── servicios/
        └── reservas.js
```

## 5. Requisitos previos

- Node.js y npm instalados.
- Una cuenta de MongoDB Atlas con un clúster M0 creado.
- Un usuario de base de datos con permisos de lectura y escritura sobre el clúster.
- La IP local autorizada en la lista de acceso de Atlas (Network Access).
- Postman (o un cliente HTTP equivalente) para probar la API.

## 6. Generación del proyecto

El proyecto completo se genera con un script de Python que crea todos los archivos y sus contenidos.

1. Crear una carpeta vacía llamada `tp-08-salas-http-mongodb`.
2. Dentro de ella, crear el archivo `generador_tp8.py` con el código del generador.
3. Ejecutar `python generador_tp8.py`. El script imprime un mensaje de confirmación al finalizar.

## 7. Instalación

Dentro de la carpeta del proyecto:

```bash
npm install express@5 ejs express-ejs-layouts morgan dotenv mongoose
npm install --save-dev prettier eslint @eslint/js
```

## 8. Configuración

### 8.1. Variables de entorno

Copiar el archivo de referencia y completarlo:

```bash
cp .env.example .env
```

El archivo `.env` debe contener:

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u8?retryWrites=true&w=majority
```

La URI debe incluir el nombre de la base de datos `reservas_salas_u8` antes del signo `?`. El usuario y la clave son los de la base de datos de Atlas, no los de la cuenta de Atlas. Si la clave contiene caracteres especiales, deben codificarse en formato URL.

El archivo `.env` está excluido del control de versiones mediante `.gitignore`.

### 8.2. Preparación de Atlas y resolución DNS

Atlas expone la conexión mediante un registro SRV. En algunos entornos locales el resolutor del sistema no puede resolver dicho registro. Para evitarlo, el módulo `src/config/base-datos.js` fuerza los servidores DNS de Google y Cloudflare (`8.8.8.8` y `1.1.1.1`) al iniciar la aplicación.

### 8.3. Validación de configuración

El módulo `src/config/entorno.js` valida al arrancar:

- Que `PORT` sea un entero entre 1 y 65535.
- Que `MONGODB_URI` esté definida y comience con `mongodb`.

Si alguna validación falla, el proceso muestra un mensaje de error y finaliza con código 1, sin abrir el puerto.

## 9. Ejecución

```bash
npm run start:local
```

Este comando ejecuta `node --env-file=.env src/index.js`. Al iniciar, el servidor se conecta a Atlas y, si la conexión es exitosa, comienza a escuchar en el puerto configurado. Para detenerlo, usar `Ctrl+C`; el proceso cierra la conexión con MongoDB antes de salir.

Scripts disponibles:

| Script | Descripción |
| :--- | :--- |
| `npm run start` | Inicia el servidor sin cargar `.env` (útil cuando las variables ya están en el entorno). |
| `npm run start:local` | Inicia el servidor cargando `.env`. |
| `npm run format` | Aplica Prettier a `src` y `scripts`. |
| `npm run format:check` | Verifica el formato sin modificar archivos. |
| `npm run lint` | Ejecuta ESLint sobre `src` y `scripts`. |
| `npm run check` | Ejecuta la verificación de formato y el análisis estático. |

## 10. Arquitectura por capas

- **Configuración** (`src/config/`): carga de variables de entorno, conexión a la base de datos y resolución DNS.
- **Modelo** (`src/modelos/reserva.js`): esquema de Mongoose con validaciones y transformación `toJSON`.
- **Servicio** (`src/servicios/reservas.js`): funciones de negocio (`obtenerTodas`, `buscarPorId`, `contarReservas`, `crear`). Es la única capa que accede al modelo.
- **Rutas** (`src/rutas/`): `api.js` expone los endpoints JSON y `html.js` las vistas. Ambas consumen el mismo servicio.
- **Middleware** (`src/middleware/errores.js`): manejo centralizado de errores y respuestas 404 para rutas desconocidas.
- **Aplicación** (`src/app.js`): configuración de Express, motor de vistas, archivos estáticos, parsers de cuerpo y montaje de routers.
- **Arranque** (`src/index.js`): carga de configuración, conexión a la base de datos, registro de cierre ordenado y escucha HTTP.

## 11. Modelo de datos y validaciones

La colección se denomina `reservas`. Cada documento tiene los siguientes campos:

| Campo | Tipo | Obligatorio | Restricciones |
| :--- | :--- | :--- | :--- |
| `estudiante` | String | Sí | Se recortan espacios. |
| `email` | String | Sí | Debe contener el carácter `@`. |
| `sala` | String | Sí | Valores permitidos: `Sala Norte`, `Sala Sur`, `Sala Multimedia`. |
| `fecha` | String | Sí | Longitud mínima de 1 carácter. |
| `turno` | String | Sí | Valores permitidos: `Mañana`, `Tarde`, `Noche`. |
| `personas` | Number | Sí | Entero entre 1 y 6. |
| `estado` | String | No | Valores permitidos: `pendiente`, `confirmada`. Por defecto, `pendiente`. |

Al convertir el documento a JSON, Mongoose reemplaza `_id` por `id` (texto) y elimina `__v`.

Alcance de las validaciones: el modelo admite exactamente los seis campos provistos por el cliente. El campo `estado` no puede asignarse en la creación, ya que el servicio solo toma los seis campos mencionados. Las reglas no verifican que el dominio del email exista, que la fecha no sea pasada, que no haya superposición de turnos ni que se respete un cupo máximo por sala.

## 12. Endpoints de la API

Base: `http://localhost:3000/api`

| Método | Ruta | Resultado esperado |
| :--- | :--- | :--- |
| `GET` | `/api/reservas` | 200 y arreglo con todas las reservas. |
| `GET` | `/api/reservas?sala=Sala%20Norte` | 200 y únicamente las reservas cuya sala coincide exactamente. |
| `GET` | `/api/reservas/:id` | 200 y el recurso solicitado. |
| `POST` | `/api/reservas` | 201, el recurso guardado y la cabecera `Location` con la ruta del nuevo recurso. |

Reglas adicionales:

- Si el parámetro `sala` se repite en la consulta, la respuesta es 400.
- Si el `id` no tiene el formato de un ObjectId de 24 caracteres hexadecimales, la respuesta es 400.
- Si el `id` tiene formato válido pero no existe, la respuesta es 404.
- Si el cuerpo del `POST` está ausente o vacío, la respuesta es 400.
- Si `personas` es un booleano, un arreglo o un objeto, la respuesta es 400.

### 12.1. Creación de una reserva en Postman

1. Crear una petición `POST` a `http://localhost:3000/api/reservas`.
2. En la pestaña **Body**, seleccionar `raw` y el formato `JSON`. Postman agrega automáticamente la cabecera `Content-Type: application/json`.
3. Enviar el siguiente cuerpo:

```json
{
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-21",
  "turno": "Mañana",
  "personas": 2
}
```

La respuesta esperada es 201, con el documento guardado (incluido `id` y `estado: "pendiente"`) y la cabecera `Location` apuntando a `/api/reservas/<id>`.

## 13. Vistas web

| Ruta | Descripción |
| :--- | :--- |
| `/` | Página de inicio con enlace al catálogo. |
| `/estado` | Respuesta JSON con el conteo de reservas persistidas. |
| `/reservas` | Listado de reservas en tarjetas. |
| `/reservas/nueva` | Formulario de alta. |
| `/reservas/:id` | Detalle de una reserva. |

El envío del formulario (`POST /reservas`) redirige con 302 a `/reservas` cuando la operación es exitosa. Si falla, responde 400 y vuelve a mostrar el formulario con los datos ingresados y un mensaje de error.

## 14. Manejo de errores

El middleware global distingue el tipo de petición por la ruta:

| Situación | Respuesta en `/api` | Respuesta en vistas |
| :--- | :--- | :--- |
| Datos inválidos (`ValidationError`, `CastError`, JSON mal formado) | 400 con JSON `{ error, detalles }` | Página 400 |
| Ruta inexistente | 404 con JSON `{ error }` | Página 404 |
| Error inesperado | 500 con JSON `{ error }` | Página 500 |

Los detalles técnicos se registran en la consola del servidor. Al cliente se le envía un mensaje genérico en los errores 500.

## 15. Matriz de pruebas

Las pruebas se ejecutaron con Postman y el servidor activo, contra la base de Atlas.

| Caso | Resultado esperado | Resultado observado |
| :--- | :--- | :--- |
| Listado en base nueva | 200 con arreglo vacío | OK. Status 200, body `[]`. |
| Creación válida | 201 y cabecera `Location` | OK. Status 201, `Location` asignado. |
| Consulta por id creado | 200 con el mismo recurso | OK. Mismo `id` y `estado: pendiente`. |
| Consulta tras reiniciar el servidor | 200 con el mismo id | OK. El documento se recuperó tras reiniciar. |
| Id `"1"` (mal formado) | 400 | OK. Status 400, id mal formado. |
| Id válido inexistente | 404 | OK. Status 404, reserva inexistente. |
| Estudiante vacío o email sin `@` | 400, sin alta | OK. Status 400, `ValidationError`. |
| Sala o turno no permitido | 400, sin alta | OK. Status 400, error de enumeración. |
| Fecha vacía | 400, sin alta | OK. Status 400, campo requerido. |
| `personas` con valor 0, 7, 2.5 o `"abc"` | 400, sin alta | OK. Status 400. |
| `personas` como booleano, arreglo u objeto | 400, sin alta | OK. Status 400 por validación explícita en la ruta. |
| `POST` sin cuerpo o JSON mal formado | 400 | OK. Status 400. |
| Campos extra `estado` o `_id` en el cuerpo | No los asigna el cliente | OK. Se ignoraron y `estado` quedó en `pendiente`. |
| Filtro exacto por sala | Solo coincidencias | OK. `?sala=Sala%20Norte` devolvió coincidencias; una sala inexistente devolvió `[]`. |
| Sala repetida como parámetro | 400 | OK. Status 400. |
| Listar dos veces | Cantidad estable | OK. No se alteró la base (cantidad 1). |
| Formulario válido e inválido | 302 o 400 | OK. Probado en navegador. |
| Ruta `/estado` | Conteo persistente | OK. Lee el conteo exacto con promesas asíncronas. |
| Arranque sin `MONGODB_URI` | No abre el puerto | OK. El proceso finaliza con código 1. |

## 16. Evidencia de persistencia

Procedimiento seguido:

1. Se creó una reserva desde Postman. El servidor respondió 201 y la cabecera `Location` con la ruta del nuevo recurso.
2. Se detuvo el proceso en la terminal con `Ctrl+C`.
3. Se volvió a iniciar el servidor con `npm run start:local`.
4. Se consultó la ruta guardada y MongoDB Atlas devolvió el mismo documento, con el mismo `id`.

Esto demuestra que la información sobrevive a los ciclos de vida del proceso Node.js.

## 17. Notas técnicas

- Las rutas desconocidas se capturan con manejadores montados sin patrón de ruta. Así `src/app.js` evita el comodín `*`, que Express 5 no admite sin nombre. El manejador de `/api` atrapa cualquier petición API no resuelta y el manejador HTML atrapa el resto:

```javascript
// 5. Catch-all
app.use('/api', ruteoDesconocidoApi);
app.use(ruteoDesconocidoHtml);
```

Este orden debe mantenerse: los catch-all van después de `app.use('/api', routerApi)` y `app.use('/', routerHtml)`, y antes de `manejadorErroresGlobal`.

- La ruta `POST /api/reservas` valida el tipo de `personas` de forma manual antes de llamar al servicio, además de las reglas del modelo.
- El formulario web no aplica la validación manual de tipos de la API, pero el modelo y el servicio rechazan los valores inválidos y el middleware responde con un 400 y el formulario conservado.
- La URI de Atlas y las credenciales no deben publicarse. Si se exponen, deben rotarse desde Atlas.