import app from '../src/app.js';

// Vercel Serverless Function Handler
// Exports the Express application directly as a request listener
export default function handler(req, res) {
  return app(req, res);
}

