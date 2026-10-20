const express = require('express');
const servicio = require('../servicios/reservas');

const router = express.Router();
const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];

router.get('/', (req, res) => res.render('inicio', { titulo: 'Inicio', solicitudId: "HTML-000" }));

router.get('/estado', async (req, res, next) => {
    try {
        const conteo = await servicio.contarReservas();
        res.json({ servicio: "activo persistente", reservas: conteo });
    } catch (err) { next(err); }
});

router.get('/reservas', async (req, res, next) => {
    try {
        const reservas = await servicio.obtenerTodas();
        res.render('reservas/lista', { titulo: 'Listado', reservas, seccion: 'Catálogo' });
    } catch (err) { next(err); }
});

router.get('/reservas/nueva', (req, res) => {
    res.render('reservas/nueva', { titulo: 'Nueva Reserva', seccion: 'Formulario', salasPermitidas, error: null, datosIngresados: {} });
});

router.get('/reservas/:id', async (req, res, next) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).render('no-encontrado', { titulo: 'Error 400', mensaje: 'ID inválido.' });
        const reserva = await servicio.buscarPorId(req.params.id);
        if (!reserva) return res.status(404).render('no-encontrado', { titulo: 'Error 404', mensaje: 'Reserva no encontrada.' });
        res.render('reservas/detalle', { titulo: 'Detalle', reserva });
    } catch (err) { next(err); }
});

router.post('/reservas', async (req, res, next) => {
    try {
        await servicio.crear(req.body);
        res.redirect('/reservas');
    } catch (err) {
        res.status(400).render('reservas/nueva', { titulo: 'Nueva Reserva', seccion: 'Formulario', salasPermitidas, error: "Verifique los campos ingresados. " + err.message, datosIngresados: req.body });
    }
});

module.exports = router;
