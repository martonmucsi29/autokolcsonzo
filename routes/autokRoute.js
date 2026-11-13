import pool from '../utils/db.js';
import { Router } from 'express';

const autorouter = Router();

autorouter.get('/', async (req, res) => {
    let params = [];
    let szurok = [];

    const {kategoria} = req.query;

    let sql = `SELECT a.id, a.rendszam, a.marka, a.modell, a.kategoria, a.napidij, COUNT(b.auto_id) AS berlesDb FROM autok a LEFT JOIN berlesek b ON b.auto_id = a.id LEFT JOIN ugyfelek u ON u.id = b.ugyfel_id`;

    if(kategoria){
        params.push(kategoria);
        szurok.push(`a.kategoria = ?`);
    }
    if(szurok.length > 0) {
        sql += ` WHERE ${szurok.join(' AND ')}`;
    }

    sql += ` GROUP BY a.id`;

    try{
        const [results] = await pool.query(sql, params);
        if (results.length === 0) {
            return res.status(400).json({hiba: "Nincs ilyen típusú jármű az adatbázisban"});
        }
        res.json({results});
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'})
    }
});

autorouter.get('/szabad', async (req, res) => {
    let params = [];
    let szurok = [];

    const {tol, ig} = req.query;

    let sql = `SELECT a.id, a.rendszam, a.marka, a.modell, a.kategoria, a.napidij, COUNT(b.auto_id) AS berlesDb, b.kezdet, b.veg FROM autok a LEFT JOIN berlesek b ON b.auto_id = a.id LEFT JOIN ugyfelek u ON u.id = b.ugyfel_id`;

    if(tol > ig || !tol || !ig){
        return res.status(400).json({hiba: "Hiányzó vagy hibás dátum!"});
    }

    if(tol && ig){
        params.push(tol, ig);
        szurok.push(`NOT EXISTS (SELECT 1 FROM berlesek b WHERE b.auto_id = a.id AND b.kezdet <= ? AND b.veg >= ?)`);
    }

    if(szurok.length > 0) {
        sql += ` WHERE ${szurok.join(' AND ')}`;
    }

    sql += ` GROUP BY a.id`;

    try{
        const [results] = await pool.query(sql, params);
        res.json({"Szabad autók": results});
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'});
    }
});

autorouter.get('/:id', async (req, res) => {
    const {id} = req.params;

    let sql = `SELECT a.id, a.rendszam, a.marka, a.modell, a.kategoria, a.napidij FROM autok a LEFT JOIN berlesek b ON b.auto_id = a.id LEFT JOIN ugyfelek u ON u.id = b.ugyfel_id WHERE a.id = ? GROUP BY a.id`;
    let sqlberles = `SELECT u.id, u.nev, u.email, b.kezdet, b.veg, DATEDIFF(b.veg, b.kezdet) + 1 AS napok, (a.napidij * (DATEDIFF(b.veg, b.kezdet) + 1)) AS dij FROM autok a LEFT JOIN berlesek b ON b.auto_id = a.id LEFT JOIN ugyfelek u ON u.id = b.ugyfel_id WHERE a.id = ?`;
    let sqlsum = `SELECT SUM(a.napidij * (DATEDIFF(b.veg, b.kezdet) + 1)) AS osszbevetel FROM autok a LEFT JOIN berlesek b ON b.auto_id = a.id LEFT JOIN ugyfelek u ON u.id = b.ugyfel_id WHERE a.id = ?`;

    try{
        let [results] = await pool.query(sql, id);
        let [resultsber] = await pool.query(sqlberles, id);
        let [resultssum] = await pool.query(sqlsum, id);
        if (results.length === 0) {
            return res.status(404).json({
            "Autó": results,
            "Bérlések": resultsber,
            "Összes bevétel": resultssum
           });
        }
        res.json(
            {"Autó": results,
             "Bérlések": resultsber,
             "Összes bevétel": resultssum
            }
        );
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'});
    }
})

export default autorouter;