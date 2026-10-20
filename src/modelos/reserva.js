const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
    estudiante: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, match: /@/ },
    sala: { type: String, required: true, enum: ["Sala Norte", "Sala Sur", "Sala Multimedia"] },
    fecha: { type: String, required: true, trim: true, minlength: 1 },
    turno: { type: String, required: true, enum: ["Mañana", "Tarde", "Noche"] },
    personas: { type: Number, required: true, min: 1, max: 6, validate: { validator: Number.isInteger } },
    estado: { type: String, enum: ["pendiente", "confirmada"], default: "pendiente" }
}, { 
    collection: 'reservas',
    toJSON: { transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; } }
});

module.exports = mongoose.model('Reserva', reservaSchema);
