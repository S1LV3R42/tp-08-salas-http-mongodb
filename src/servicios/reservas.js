const Reserva = require('../modelos/reserva');

async function obtenerTodas(filtro = {}) {
    return await Reserva.find(filtro);
}

async function buscarPorId(id) {
    return await Reserva.findById(id);
}

async function contarReservas() {
    return await Reserva.countDocuments();
}

async function crear(datosValidados) {
    const { estudiante, email, sala, fecha, turno, personas } = datosValidados;
    const nuevaReserva = new Reserva({ estudiante, email, sala, fecha, turno, personas });
    return await nuevaReserva.save();
}

module.exports = { obtenerTodas, buscarPorId, contarReservas, crear };
