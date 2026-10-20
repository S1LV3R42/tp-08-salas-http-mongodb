const express = require('express');
const path = require('node:path');
const expressLayouts = require('express-ejs-layouts');
const morgan = require('morgan');
const routerHtml = require('./rutas/html');
const routerApi = require('./rutas/api');
const { manejadorErroresGlobal, ruteoDesconocidoApi, ruteoDesconocidoHtml } = require('./middleware/errores');

function crearAplicacion(config) {
    const app = express();

    // 1. Morgan (Logs)
    app.use(morgan(config.entorno === 'production' ? 'combined' : 'dev'));

    // 2. Configuración de vistas
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "..", "views"));
    app.use(expressLayouts);
    app.set("layout", "layouts/main");

    // 3. Recursos estáticos y parsers
    app.use(express.static(path.join(__dirname, "..", "public")));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    // 4. Montaje de rutas válidas
    app.use('/api', routerApi);
    app.use('/', routerHtml);

    // 5. Catch-all (Rutas desconocidas a prueba de fallos para Express 5)
    // Atrapa cualquier petición bajo /api que no haya hecho match antes
    app.use('/api', ruteoDesconocidoApi);
    
    // Atrapa cualquier otra petición global que haya sobrado
    app.use(ruteoDesconocidoHtml);

    // 6. Manejador de errores global
    app.use(manejadorErroresGlobal);

    return app;
}

module.exports = crearAplicacion;