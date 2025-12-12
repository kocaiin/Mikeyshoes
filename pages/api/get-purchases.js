import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'ecommerce');
    const purchases = db.collection('purchases');

    const orders = await purchases
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Failed to fetch purchases', error);
    return res.status(500).json({ message: 'Failed to fetch purchases.' });
  }
}
