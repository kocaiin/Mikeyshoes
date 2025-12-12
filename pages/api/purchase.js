import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { items = [], total = 0 } = req.body || {};

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'No items to save.' });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'ecommerce');
    const purchases = db.collection('purchases');

    await db.collection('purchases').insertOne({
      items,
      total,
      createdAt: new Date(),
    });

    // Award points
    await db.collection('users').updateOne(
      { _id: 'default-user' },
      { $inc: { points: 200 } },
      { upsert: true }
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Failed to save purchase', error);
    return res.status(500).json({ message: 'Failed to save purchase.' });
  }
}

