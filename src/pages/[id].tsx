import React, { useCallback, useEffect, useState } from 'react';
import {useRouter} from 'next/router'
import axios from 'axios';

interface ITrade {
  _id: string;
  player1: [{
    name: string,
    base_experience: number
  }],
  player2: [{
    name: string,
    base_experience: number
  }],
  created_at: string;
}

const Trade: React.FC = () => {
  const router = useRouter()
  const { id } = router.query

  const [trade, setTrade] = useState<ITrade>({} as ITrade);

  const fetchTrades = useCallback(async () => {
    const {data} = await axios.get('/api/trades', { params: { id }})
    setTrade(data)
  },[])

  useEffect(() => {
    fetchTrades()
  }, [])

  return (
    <main>
      {trade._id}
    </main>
  );
}

export default Trade;
