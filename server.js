const express = require('express');
const bodyParser = require('body-parser');
const mongo = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId; 

const client = new mongo('mongodb://127.0.0.1:27017');

client.connect();
const coleccionViajes = client.db('viajes').collection('viajes');
const coleccionGastos = client.db('viajes').collection('gastos');

const app = express();
const jsonParser = bodyParser.json();

async function insertarViaje(coleccionViajes, req, res)
{
    let error = false;
    if (!req.body.hasOwnProperty('nombre')) error = 'No se ha definido un nombre';
    if (error) return res.status(400).json({ success: false, error });

    try {
        await coleccionViajes.insertOne({
            nombre: req.body.nombre
        });

        return res.status(201).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, error});
    } 
}

async function obtenerViajes(coleccionViajes, req, res)
{
    try {
        const viajes = await coleccionViajes.find().toArray();

        return res.status(200).json({
            success: true,
            viajes
        });

    } catch (error) {
        return res.status(500).json({ success: false, error});
    } 
}

async function insertarGastoViaje(coleccionViajes, coleccionGastos, req, res)
{
    const categorias = ['comida', 'transporte', 'alojamiento', 'otros'];

    try {
        if (!ObjectId.isValid(req.params.viajeId)) throw 'El viaje indicado no es válido';;

        const viaje = await coleccionViajes.findOne(ObjectId(req.params.viajeId));
        if (!viaje) throw 'No se ha encontrado el viaje indicado';

        if (!req.body.hasOwnProperty('descripcion')) throw 'No se ha definido una descripción';
        
        if (!req.body.hasOwnProperty('cantidad')) throw 'No se ha definido una cantidad';

        if (!req.body.hasOwnProperty('categoria') || !categorias.includes(req.body.categoria)) throw 'No se ha definido una categoría váida';

        if (!req.body.hasOwnProperty('fecha')) throw 'No se ha definido una fecha';

        await coleccionGastos.insertOne({
            viajeId: ObjectId(req.params.viajeId),
            descripcion: req.body.descripcion,
            cantidad: req.body.cantidad,
            categoria: req.body.categoria,
            fecha: req.body.fecha
        });
    
        return res.status(201).json({ success: true });
        
    } catch (error) {
        return res.status(400).json({ success: false, error});
    } 
}

async function obtenerGastosViaje(coleccionViajes, coleccionGastos, req, res)
{
    try {
        if (!ObjectId.isValid(req.params.viajeId)) throw 'El viaje indicado no es válido';;

        const viaje = await coleccionViajes.findOne(ObjectId(req.params.viajeId));
        if (!viaje) throw 'No se ha encontrado el viaje indicado';;


        const gastos = await coleccionGastos.find({ viajeId: ObjectId(req.params.viajeId) }).toArray();

        return res.status(200).json({success: true, gastos});

    } catch (error) {
        return res.status(400).json({ success: false, error});
    } 
}

app.post('/viajes', jsonParser, (req, res) => { 
    return insertarViaje(coleccionViajes, req, res);
});

app.get('/viajes', (req, res) => {
    return obtenerViajes(coleccionViajes, req, res);
});


app.post('/viajes/:viajeId/gastos', jsonParser, (req, res) => { 
    return insertarGastoViaje(coleccionViajes, coleccionGastos, req, res);
});

app.get('/viajes/:viajeId/gastos', (req, res) => {
    return obtenerGastosViaje(coleccionViajes, coleccionGastos, req, res);
});

app.listen(3000, () => console.log('Servidor iniciado'));
