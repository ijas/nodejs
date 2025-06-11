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
    const { symbol, side, qty, trigger_time } = req.body;

    const payload = {
      symbol: symbol,
      qty: qty,
      side: side,
      order_type : 'market',
      post_only: false,
      client_order_id: 'webhook-' + Date.now()
    };

   
    // Utility function to get Delta server time in milliseconds
async function getDeltaTimestamp() {
  const res = await axios.get('https://cdn-ind.testnet.deltaex.org/v2/time');
  return res.data.epoch_in_milliseconds.toString();
}

    console.log('time',getDeltaTimestamp());
   const timestamp = await getDeltaTimestamp();
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

    const order_list = 'https://https://cdn-ind.testnet.deltaex.org/v2/l2orderbook/{symbol}';
   // const response = await axios.post(DELTA_API_URL, payload, { headers });
    const response = await axios.get(order_list, payload, { headers });

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
