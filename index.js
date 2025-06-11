import express from 'express';
import bodyParser from 'body-parser';
import { KiteConnect } from 'kiteconnect';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const kc = new KiteConnect({
  api_key: process.env.KITE_API_KEY,
});

kc.setAccessToken(process.env.KITE_ACCESS_TOKEN);
kc.generateSession("xOCamIXHS16KSDwK3Ne7RbsOvDDbU3ZR", KITE_API_SECRET)
  .then(session => {
    console.log("✅ Access Token:", session.access_token);
  })
  .catch(err => console.error("❌ Token Error:", err.message));

app.post('/webhook', async (req, res) => {
  try {
    const data = req.body;
    console.log('🔔 Webhook received:', data);

    const order = await kc.placeOrder("regular", {
      exchange: "NSE",
      tradingsymbol: data.symbol || "TATASTEEL",
      transaction_type: data.transaction_type || "BUY",
      quantity: data.quantity || 1,
      order_type: "MARKET",
      product: "MIS",
    });

    console.log("✅ Order Placed:", order);
    res.json({ success: true, order_id: order.order_id });
  } catch (err) {
    console.error("❌ Order Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
