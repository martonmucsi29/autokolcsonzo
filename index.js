import 'dotenv/config';
import express from 'express';
import autorouter from './routes/autokRoute.js';
import ugyfelrouter from './routes/ugyfelRoute.js';
import statrouter from './routes/statRoute.js';
import berlesrouter from './routes/berlesRoute.js';

const app = express();
app.use(express.json());

app.use('/autok', autorouter);
app.use('/ugyfelek', ugyfelrouter);
app.use('/statisztika', statrouter);
app.use('/berlesek', berlesrouter);

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => console.log(`Szerver fut: http://localhost:${PORT}`));