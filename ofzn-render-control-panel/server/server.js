import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

const db = new Database('ofzn.db');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const PORT = process.env.PORT || 8080;

// ---------- Helpers ----------
function auth(req, res, next){
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if(!token) return res.status(401).json({error:'no_token'});
  try{ req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch{ return res.status(401).json({error:'invalid_token'}); }
}

// ---------- API ----------
const api = express.Router();

// Admin login (for control panel)
api.post('/auth/login', (req,res)=>{
  const {email, password} = req.body || {};
  if(!email || !password) return res.status(400).json({error:'missing_fields'});
  const a = db.prepare('SELECT * FROM admins WHERE email=?').get(email.toLowerCase());
  if(a && bcrypt.compareSync(password, a.password_hash)){
    const token = jwt.sign({ id:a.id, email:a.email, role:'admin' }, JWT_SECRET, { expiresIn:'8h' });
    return res.json({ token, role:'admin' });
  }
  return res.status(401).json({error:'invalid_credentials'});
});

// Users management (admin)
api.get('/users', auth, (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({error:'forbidden'});
  const rows = db.prepare('SELECT id, email, status, expires_at, m3u_url FROM users ORDER BY id DESC').all();
  res.json(rows);
});
api.post('/users', auth, (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({error:'forbidden'});
  const {email, password, m3u_url, days=30} = req.body || {};
  if(!email || !password) return res.status(400).json({error:'missing_fields'});
  const exists = db.prepare('SELECT id FROM users WHERE email=?').get(email.toLowerCase());
  if(exists) return res.status(409).json({error:'user_exists'});
  const hash = bcrypt.hashSync(password, 10);
  const expires = new Date(Date.now()+days*24*3600*1000).toISOString();
  const stmt = db.prepare('INSERT INTO users (email,password_hash,m3u_url,status,expires_at) VALUES (?,?,?,?,?)');
  const info = stmt.run(email.toLowerCase(), hash, m3u_url || null, 'active', expires);
  res.json({id: info.lastInsertRowid});
});
api.put('/users/:id/status', auth, (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({error:'forbidden'});
  const {status} = req.body || {};
  db.prepare('UPDATE users SET status=? WHERE id=?').run(status, req.params.id);
  res.json({ok:true});
});
api.put('/users/:id/m3u', auth, (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({error:'forbidden'});
  const {m3u_url} = req.body || {};
  db.prepare('UPDATE users SET m3u_url=? WHERE id=?').run(m3u_url || null, req.params.id);
  res.json({ok:true});
});

// Client login for the app (email/password)
api.post('/client/login', (req,res)=>{
  const {email, password} = req.body || {};
  if(!email || !password) return res.status(400).json({error:'missing_fields'});
  const u = db.prepare('SELECT id, email, password_hash, status, expires_at, m3u_url FROM users WHERE email=?').get(email.toLowerCase());
  if(!u) return res.status(404).json({error:'not_found'});
  if(u.status !== 'active') return res.status(403).json({error:'inactive'});
  if(!bcrypt.compareSync(password, u.password_hash || '')) return res.status(401).json({error:'invalid_credentials'});
  res.json({ status: u.status, expires_at: u.expires_at, m3u_url: u.m3u_url, playlists: [] });
});

app.use('/api', api);

// Serve built admin UI at /admin
import serveStatic from 'serve-static';
app.use('/admin', serveStatic(path.join(__dirname, 'public')));
app.get('/admin/*', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/', (req,res)=> res.status(200).send('OFZN control panel API. Visit /admin'));

app.listen(PORT, ()=> console.log(`OFZN server listening on :${PORT}`));
