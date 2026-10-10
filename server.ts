import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authMiddleware, AuthenticatedRequest } from './server/auth.js';
import { getOrCreateUser } from './src/db/users.ts';
import { experiencesRouter } from './server/routes/experiences.js';
import { submissionsRouter } from './server/routes/submissions.js';
import { dashboardRouter } from './server/routes/dashboard.js';
import { adminRouter } from './server/routes/admin.js';
import { reportsRouter } from './server/routes/reports.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global Authentication parser middleware
app.use(authMiddleware);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'VYBE',
    powered_by: 'Y Series',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Current user profile endpoint
app.get('/api/auth/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.json({ authenticated: false, user: null });
  }

  const isOwnerAdmin = Boolean(req.user.email && req.user.email.toLowerCase() === 'yashrajart1999@gmail.com');

  res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      clerk_user_id: req.user.clerk_user_id,
      email: req.user.email,
      public_display_name: req.user.public_display_name,
      username: req.user.username,
      avatar_url: req.user.avatar_url,
      role: isOwnerAdmin ? 'admin' : 'user',
      account_status: req.user.account_status,
      is_admin: isOwnerAdmin,
    },
  });
});

// Demo / Sandbox Switcher endpoint for quick evaluation of Creator role
app.post('/api/auth/switch-demo', async (req, res) => {
  try {
    const { role } = req.body;
    if (role === 'admin') {
      return res.status(403).json({
        error: 'Admin panel is restricted strictly to yashrajart1999@gmail.com. Please sign in with your Google administrator account.',
      });
    } else if (role === 'creator') {
      const creatorUser = await getOrCreateUser(
        'user_creator_pookie',
        'creator@vybe.cute',
        'Pookie Creator'
      );
      return res.json({
        token: creatorUser.uid,
        user: {
          id: String(creatorUser.id),
          clerk_user_id: creatorUser.uid,
          email: creatorUser.email,
          public_display_name: creatorUser.displayName,
          username: creatorUser.username,
          avatar_url: creatorUser.avatarUrl,
          role: 'user',
          account_status: creatorUser.accountStatus,
          is_admin: false,
        },
      });
    }
    res.json({ token: null, user: null });
  } catch (err) {
    console.error('Switch demo error:', err);
    res.status(500).json({ error: 'Failed to switch demo role' });
  }
});

// Mount modular API routers
app.use('/api/experiences', experiencesRouter);
app.use('/api', submissionsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportsRouter);

// Start server with Vite middleware integration
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 VYBE platform listening on http://0.0.0.0:${PORT} (Powered by Y Series)`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
