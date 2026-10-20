require('dotenv').config();

function cargarConfiguracion() {
    const puerto = parseInt(process.env.PORT || '3000', 10);
    if (isNaN(puerto) || puerto < 1 || puerto > 65535) {
        console.error("Error crítico: Puerto configurado inválido.");
        process.exit(1);
    }
    const uri = process.env.MONGODB_URI;
    if (!uri || !uri.startsWith('mongodb')) {
        console.error("Error: MONGODB_URI inválida o faltante. El servidor no iniciará.");
        process.exit(1);
    }
    return { puerto, entorno: process.env.NODE_ENV === 'production' ? 'production' : 'development', mongodbUri: uri };
}

module.exports = cargarConfiguracion;
