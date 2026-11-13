import pool from '../utils/db.js';
import { Router } from 'express';

const ugyfelrouter = Router();

ugyfelrouter.get('/', async (req, res) => {
    let sql = `SELECT u.id, u.nev, COUNT(b.ugyfel_id) AS berlesDb, SUM(DATEDIFF(b.veg, b.kezdet) + 1) AS osszNap, SUM(a.napidij * (DATEDIFF(b.veg, b.kezdet) + 1)) AS osszKoltes FROM autok a RIGHT JOIN berlesek b ON b.auto_id = a.id RIGHT JOIN ugyfelek u ON u.id = b.ugyfel_id GROUP BY u.nev ORDER BY osszKoltes DESC`;

    try{
        const [results] = await pool.query(sql);
        res.json({"Ügyfelek": results});
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'});
    }
});

export default ugyfelrouter;