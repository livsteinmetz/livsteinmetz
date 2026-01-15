import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5174;
const JWT_SECRET = process.env.JWT_SECRET!;

app.use(cors());
app.use(express.json());

// --- auth ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u || !(await bcrypt.compare(password, u.passHash))) return res.sendStatus(401);
  const token = jwt.sign({ sub: u.id, email: u.email, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

function requireAdmin(req: any, res: any, next: any) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  try {
    const payload = jwt.verify(token!, JWT_SECRET) as any;
    if (payload.role !== 'admin') return res.sendStatus(403);
    req.user = payload;
    next();
  } catch {
    res.sendStatus(401);
  }
}

// --- CRUD ---
app.get('/api/reflections', async (_req, res) => {
  res.json(await prisma.reflection.findMany({ orderBy: { createdAt: 'desc' } }));
});

app.get('/api/reflections/:id', async (req, res) => {
  const r = await prisma.reflection.findUnique({ where: { id: req.params.id } });
  if (!r) return res.sendStatus(404);
  res.json(r);
});

app.post('/api/reflections', requireAdmin, async (req, res) => {
  const created = await prisma.reflection.create({ data: req.body });
  res.status(201).json(created);
});

app.put('/api/reflections/:id', requireAdmin, async (req, res) => {
  const updated = await prisma.reflection.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

app.delete('/api/reflections/:id', requireAdmin, async (req, res) => {
  await prisma.reflection.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
