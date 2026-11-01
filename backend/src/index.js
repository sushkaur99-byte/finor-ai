import app from './app.js';
import { config } from './config/index.js';

// Local Standalone HTTP Server (used only in local dev: npm run dev or npm start)
const server = app.listen(config.port, () => {
  console.log(`🚀 FINORA AI Backend listening on port ${config.port} (${config.nodeEnv})`);
  console.log(`🔗 Health check available at: http://localhost:${config.port}/api/health`);
});

export default app;
export { server };
