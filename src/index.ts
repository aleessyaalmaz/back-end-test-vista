import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';
import { prisma } from './prisma';

const app = express();
app.use(cors());
app.use(express.json());

// Bonus: log method, path and timestamp for every request
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Home page: clickable links to the API
app.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const companies = await prisma.company.findMany({
      include: { services: true },
      orderBy: { name: 'asc' },
    });

    const companyItems = companies
      .map((c) => {
        const services = c.services.length
          ? c.services
              .map(
                (s) =>
                  `<li><a href="/services/${s.id}">${escapeHtml(s.name)}</a>
                   <span class="muted">RM ${s.price.toFixed(2)}</span></li>`
              )
              .join('')
          : '<li class="muted">No services yet</li>';
        return `<li>
          <a href="/companies">${escapeHtml(c.name)}</a>
          <span class="muted">${escapeHtml(c.registrationNumber)}</span>
          <ul>${services}</ul>
        </li>`;
      })
      .join('');

    res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Vista API</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 16px; line-height: 1.6; }
    h1 { margin-bottom: 0; }
    .muted { color: #888; font-size: 0.9em; margin-left: 8px; }
    a { color: #4f46e5; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: rgba(127,127,127,.15); padding: 2px 6px; border-radius: 6px; }
    li { margin: 4px 0; }
  </style>
</head>
<body>
  <h1>Vista API</h1>
  <p class="muted" style="margin-left:0">Companies and services REST API</p>

  <h2>Endpoints</h2>
  <ul>
    <li><a href="/companies">GET /companies</a> <span class="muted">all companies with their services</span></li>
    <li><code>GET /services/:id</code> <span class="muted">click a service below</span></li>
    <li><code>POST /companies</code> and <code>POST /services</code>
      <span class="muted">use Postman or the Flutter app (browser links can only send GET)</span></li>
  </ul>

  <h2>Browse the data</h2>
  <ul>${companyItems || '<li class="muted">No companies yet</li>'}</ul>
</body>
</html>`);
  } catch (e) {
    next(e);
  }
});

app.use(routes);

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));