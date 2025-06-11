import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const DELTA_API_URL = 'https://cdn-ind.testnet.deltaex.org/v2/orders';

app.post('/webhook', async (req, res) => {
  try {
    const { symbol, side, qty, order_type = 'market' } = req.body;

    const payload = {
      symbol,
      qty,
      side,
      order_type,
      post_only: false,
      client_order_id: 'webhook-' + Date.now()
    };

    const timestamp = Date.now().toString();
    const signaturePayload = timestamp + JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', process.env.DELTA_API_SECRET)
      .update(signaturePayload)
      .digest('hex');

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'api-key': process.env.DELTA_API_KEY,
      'signature': signature,
      'timestamp': timestamp
    };

    const response = await axios.post(DELTA_API_URL, payload, { headers });

    console.log('✅ Order Sent:', response.data);
    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌ Order Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Order failed', details: err.response?.data || err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Webhook middleware is live.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
