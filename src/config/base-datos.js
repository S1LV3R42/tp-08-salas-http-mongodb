const mongoose = require('mongoose');
const dns = require('node:dns');

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function conectarBD(uri) {
    try {
        await mongoose.connect(uri);
        console.log("Conectado a MongoDB Atlas (Tier M0) exitosamente.");
    } catch (error) {
        console.error("Fallo crítico al conectar a MongoDB:", error.message);
        throw error;
    }
}

function manejarCierre() {
    const cerrarYSalir = async () => {
        await mongoose.disconnect();
        console.log("Conexión a MongoDB cerrada por terminación del proceso.");
        process.exit(0);
    };
    process.on('SIGINT', cerrarYSalir);
    process.on('SIGTERM', cerrarYSalir);
}

module.exports = { conectarBD, manejarCierre };
