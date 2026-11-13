import pool from '../utils/db.js';
import { Router } from 'express';

const statrouter = Router();

statrouter.get('/kategoriak', async (req, res) => {
    let sql = `SELECT a.kategoria, COUNT(a.kategoria) AS autoDb, COUNT(b.auto_id) AS berlesDb, SUM(DATEDIFF(b.veg, b.kezdet) + 1) AS napDb, SUM(a.napidij * (DATEDIFF(b.veg, b.kezdet) + 1)) AS bevetel FROM autok a LEFT JOIN berlesek b ON b.auto_id = a.id LEFT JOIN ugyfelek u ON u.id = b.ugyfel_id GROUP BY a.kategoria ORDER BY bevetel DESC`;
    
    try{
        const [results] = await pool.query(sql);
        res.json({"Kategóriák statisztikái": results});
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'});
    }
});

statrouter.get('/havi', async (req, res) => {
    let sql = `SELECT DATE_FORMAT(b.kezdet, '%Y-%m') AS honap, COUNT(b.kezdet) AS berlesDb, SUM(a.napidij * (DATEDIFF(b.veg, b.kezdet) + 1)) AS bevetel FROM autok a JOIN berlesek b ON b.auto_id = a.id JOIN ugyfelek u ON u.id = b.ugyfel_id GROUP BY honap ORDER BY honap ASC`;
    
    try{
        const [results] = await pool.query(sql);
        res.json({"Hónapok statisztikái": results});
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'});
    }
});

export default statrouter;