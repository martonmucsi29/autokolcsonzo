import pool from '../utils/db.js';
import { Router } from 'express';

const berlesrouter = Router();

berlesrouter.post('/', async (req, res) => {
    const {autoId, ugyfelId, kezdet, veg} = req.body;

    if(!autoId || !ugyfelId || !kezdet || !veg){
        res.status(400).send("Hiba: Hiányzó értékek!");
    }

    let sql = `INSERT INTO berlesek (auto_id, ugyfel_id, kezdet, veg) VALUES (?, ?, ?, ?)`;
    try {   
        const [eredmeny] = await pool.query(sql, [autoId, ugyfelId, kezdet, veg]);
        return res.status(201).json(eredmeny);
    } catch (error) {
        console.error(error);
        res.status(500).json({ hiba: 'Hiba történt az adatbázisba írás során' });
    }
})

export default berlesrouter;