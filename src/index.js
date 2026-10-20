const cargarConfiguracion = require('./config/entorno');
const { conectarBD, manejarCierre } = require('./config/base-datos');
const crearAplicacion = require('./app');

async function arrancarServidor() {
    const config = cargarConfiguracion();
    
    // El servidor se queda escuchando continuamente y no desconecta Mongo tras cada petición
    await conectarBD(config.mongodbUri);
    manejarCierre();

    const app = crearAplicacion(config);
    
    app.listen(config.puerto, () => {
        console.log(`[HTTP y API] Servidor persistente iniciado en http://localhost:${config.puerto}`);
    });
}

arrancarServidor().catch(err => {
    console.error("La aplicación no pudo arrancar:", err.message);
    process.exit(1);
});
