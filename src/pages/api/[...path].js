/* eslint-disable import/no-commonjs */
const { app, ensureDbConnection } = require('../../../../server/app');

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  try {
    await ensureDbConnection();
    return app(req, res);
  } catch (error) {
    console.error('API bootstrap error:', error);
    return res.status(500).json({ error: 'Failed to initialize API' });
  }
}

