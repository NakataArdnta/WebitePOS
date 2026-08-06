import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// DIGIFLAZZ PPOB API ENDPOINTS (https://developer.digiflazz.com)
// -------------------------------------------------------------

// Helper to get Digiflazz configuration
function getDigiflazzConfig(reqHeaders?: Record<string, string | string[] | undefined>) {
  const username = (reqHeaders?.['x-digiflazz-username'] as string) || process.env.DIGIFLAZZ_USERNAME || '';
  const apiKey = (reqHeaders?.['x-digiflazz-key'] as string) || process.env.DIGIFLAZZ_API_KEY || '';
  const isProd = (reqHeaders?.['x-digiflazz-mode'] as string) === 'production' || process.env.DIGIFLAZZ_IS_PRODUCTION === 'true';

  const baseUrl = 'https://api.digiflazz.com/v1';

  return { username, apiKey, isProd, baseUrl };
}

// 1. Test Digiflazz API Connection & Deposit Balance
app.get('/api/digiflazz/check-connection', async (req, res) => {
  const config = getDigiflazzConfig(req.headers);
  if (!config.username || !config.apiKey) {
    return res.json({
      connected: false,
      message: 'Username & API Key Digiflazz belum diatur di Pengaturan atau .env',
    });
  }

  try {
    const sign = crypto.createHash('md5').update(`${config.username}${config.apiKey}depo`).digest('hex');
    const response = await fetch(`${config.baseUrl}/cek-saldo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: 'deposit',
        username: config.username,
        sign,
      }),
    });

    const data = await response.json();
    if (response.ok && data.data) {
      return res.json({
        connected: true,
        message: `Koneksi Digiflazz Berhasil! Saldo Deposit: Rp ${(data.data.deposit || 0).toLocaleString('id-ID')}`,
        deposit: data.data.deposit || 0,
        data: data.data,
      });
    } else {
      return res.json({
        connected: false,
        message: data.data?.message || data.message || 'Gagal cek saldo Digiflazz.',
        raw: data,
      });
    }
  } catch (err: any) {
    return res.json({
      connected: false,
      message: `Error koneksi Digiflazz: ${err.message || 'Network error'}`,
    });
  }
});

// 2. Fetch Digiflazz Price List Catalog
app.get('/api/digiflazz/products', async (req, res) => {
  const config = getDigiflazzConfig(req.headers);

  if (config.username && config.apiKey) {
    try {
      const sign = crypto.createHash('md5').update(`${config.username}${config.apiKey}pricelist`).digest('hex');
      const response = await fetch(`${config.baseUrl}/price-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cmd: 'prepaid',
          username: config.username,
          sign,
        }),
      });

      const data = await response.json();
      if (response.ok && data.data) {
        return res.json({
          success: true,
          source: 'digiflazz_live',
          products: data.data,
        });
      }
    } catch (err) {
      console.error('Error fetching Digiflazz products:', err);
    }
  }

  return res.json({
    success: true,
    source: 'fallback',
    message: 'Digiflazz API belum aktif. Menggunakan katalog PPOB lokal.',
  });
});

// 3. Process Digiflazz PPOB Topup Transaction
app.post('/api/digiflazz/transaction', async (req, res) => {
  const config = getDigiflazzConfig(req.headers);
  const { code, targetNumber, refId } = req.body;

  if (!code || !targetNumber) {
    return res.status(400).json({
      success: false,
      message: 'Kode produk (buyer_sku_code) dan nomor tujuan wajib diisi.',
    });
  }

  const orderRef = refId || `PPOB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  if (config.username && config.apiKey) {
    try {
      const sign = crypto.createHash('md5').update(`${config.username}${config.apiKey}${orderRef}`).digest('hex');
      const response = await fetch(`${config.baseUrl}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: config.username,
          buyer_sku_code: code,
          customer_no: targetNumber,
          ref_id: orderRef,
          sign,
          testing: !config.isProd,
        }),
      });

      const data = await response.json();
      if (response.ok && data.data) {
        const trData = data.data;
        const isSuccess = trData.status === 'Sukses' || trData.status === 'Pending';
        return res.json({
          success: isSuccess,
          source: 'digiflazz_api',
          refId: orderRef,
          sn: trData.sn || `SN-DF-${Date.now()}`,
          status: trData.status,
          message: trData.message || `Transaksi Digiflazz ${trData.status}`,
          raw: trData,
        });
      } else {
        return res.json({
          success: false,
          message: data.data?.message || data.message || 'Gagal memproses transaksi Digiflazz.',
          raw: data,
        });
      }
    } catch (err: any) {
      console.error('Digiflazz transaction error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Gagal menghubungi server Digiflazz.',
      });
    }
  }

  // Simulation mode fallback if Digiflazz key is not set
  const simulatedSn = code.startsWith('PLN')
    ? Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join('-')
    : `SN-DF-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;

  return res.json({
    success: true,
    source: 'simulated_digiflazz',
    refId: orderRef,
    sn: simulatedSn,
    message: 'Transaksi berhasil diproses (Simulasi Digiflazz).',
  });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & SERVER INITIALIZATION
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
