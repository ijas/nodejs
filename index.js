import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const DELTA_API_URL = 'https://api.delta.exchange/strategy-bots/execute';

app.post('/webhook', async (req, res) => {
  try {
    const { symbol, side, qty, stop_loss, take_profit } = req.body
   
    const order = {
      strategy_id: process.env.STRATEGY_ID,
      symbol: symbol,
      side: side, // "buy" or "sell"
      qty: qty,
     // stop_loss: parseFloat(stop_loss) - 100,   // optional
      //take_profit: parseFloat(take_profit) + 500, // optional
      trigger_time: new Date().toISOString()
    };
 console.log('Order error:', order);
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
    console.error('Order errorx:', err);
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
