import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const DELTA_API_URL = 'https://api.delta.exchange/strategies/execute';

app.post('/webhook', async (req, res) => {
  try {
    const { ticker, side, qty, sl, tp } = req.body;

    const order = {
      strategy_id: process.env.STRATEGY_ID,
      symbol: ticker,
      side: side, // "buy" or "sell"
      qty: qty,
      stop_loss: sl,   // optional
      take_profit: tp, // optional
      trigger_time: new Date().toISOString()
    };

    const response = await axios.post(DELTA_API_URL, order, {
      headers: {
        'api-key': process.env.DELTA_API_KEY,
        'api-secret': process.env.DELTA_API_SECRET,
        'Content-Type': 'application/json'
      }
    });

    console.log('Order sent:', response.data);
    res.status(200).send('Order executed');
  } catch (err) {
    console.error('Order error:', err.message);
    res.status(500).send('Order failed');
  }
});

app.get('/', (req, res) => {
  res.send('Webhook middleware is live.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
