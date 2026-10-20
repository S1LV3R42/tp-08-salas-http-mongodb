function manejadorErroresGlobal(err, req, res, next) {
    const esRutaApi = req.originalUrl.startsWith('/api/');
    console.error(`[Error] Ruta: ${req.originalUrl} | Mensaje:`, err.message);

    if (err.name === 'CastError' || err.name === 'ValidationError' || err.type === 'entity.parse.failed') {
        const mensajeError = "Datos de entrada inválidos o mal formados.";
        if (esRutaApi) return res.status(400).json({ error: mensajeError, detalles: err.message });
        return res.status(400).render('no-encontrado', { titulo: 'Error 400', mensaje: mensajeError });
    }

    const mensajeInterno = "Fallo inesperado del servidor.";
    if (esRutaApi) return res.status(500).json({ error: mensajeInterno });
    return res.status(500).render('no-encontrado', { titulo: 'Error 500', mensaje: mensajeInterno });
}

function ruteoDesconocidoApi(req, res) {
    res.status(404).json({ error: "Endpoint API no encontrado." });
}

function ruteoDesconocidoHtml(req, res) {
    res.status(404).render('no-encontrado', { titulo: 'Error 404', mensaje: 'URL inexistente.' });
}

module.exports = { manejadorErroresGlobal, ruteoDesconocidoApi, ruteoDesconocidoHtml };
