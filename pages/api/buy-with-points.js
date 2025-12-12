import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { cost } = req.body;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'ecommerce');

    const user = await db.collection('users').findOne({ _id: 'default-user' });

    if (!user || user.points < cost) {
      return res.status(400).json({ ok: false, message: 'Not enough points.' });
    }

    await db.collection('users').updateOne(
      { _id: 'default-user' },
      { $inc: { points: -cost } }
    );

    res.status(200).json({ ok: true, message: 'Redemption successful!' });
  } catch (e) {
    res.status(500).json({ ok: false, message: 'Server error.' });
  }
}
