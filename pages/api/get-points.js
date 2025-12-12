import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'ecommerce');

    const user = await db.collection('users').findOne({ _id: 'default-user' });

    res.status(200).json({ points: user?.points || 0 });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch points' });
  }
}
