import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/config/mongodb';
import { ObjectId } from 'bson';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { db, client } = await connectToDatabase();

  if (!client.isConnected()) {
    return res.status(500).json({ error: 'client DB is not connected' })
  }

  if (req.method === 'POST') {
    try {
      const trade = {
        ...req.body,
        created_at: new Date()
      }
      const [result] = await (await db.collection('trades').insertOne(trade)).ops
      return res.status(201).json(result)
    } catch (err) {
      console.error(err)
      return res.status(400).json({ error: 'error on save trade' })
    }
  }

  if (req.method === 'GET') {
    const trades = await db
      .collection("trades")
      .find()
      .toArray()

    return res.status(200).json(trades)
  }

  return res.status(403).json({ error: 'method not allowed' })
}
