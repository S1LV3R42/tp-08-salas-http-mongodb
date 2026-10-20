const express = require('express');
const servicio = require('../servicios/reservas');

const router = express.Router();

router.get('/reservas', async (req, res, next) => {
    try {
        const { sala } = req.query;
        if (Array.isArray(sala)) {
            return res.status(400).json({ error: "El parámetro de sala no puede repetirse." });
        }
        const filtro = sala ? { sala } : {};
        const reservas = await servicio.obtenerTodas(filtro);
        res.status(200).json(reservas);
    } catch (err) { next(err); }
});

router.get('/reservas/:id', async (req, res, next) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "ID mal formado." });
        }
        const reserva = await servicio.buscarPorId(req.params.id);
        if (!reserva) return res.status(404).json({ error: "Reserva inexistente." });
        res.status(200).json(reserva);
    } catch (err) { next(err); }
});

router.post('/reservas', async (req, res, next) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Cuerpo de la petición ausente o vacío." });
        }
        
        // Validación manual de tipos numéricos booleanos u objetos antes de crear
        const { personas } = req.body;
        if (typeof personas === 'boolean' || typeof personas === 'object' || Array.isArray(personas)) {
             return res.status(400).json({ error: "El campo personas debe ser un número entero." });
        }

        const reservaGuardada = await servicio.crear(req.body);
        res.setHeader('Location', `/api/reservas/${reservaGuardada._id}`);
        res.status(201).json(reservaGuardada);
    } catch (err) { next(err); }
});

module.exports = router;
