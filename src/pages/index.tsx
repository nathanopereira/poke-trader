import axios from 'axios';
import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { format, parseISO } from 'date-fns';
import Head from 'next/head';

import PokemonSelector from '@/components/PokemonSelector'

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

const tradeIsFair = (valuePlayer1: number, valuePlayer2: number): boolean => {
  // p1 = 40 -> p2 = 40 -> fair
  // p1 = 40 -> p2 = 50 -> fair
  // p1 = 40 -> p2 = 80 -> unfair for p1
  // p1 = 40 -> p2 = 30 -> fair
  // p1 = 40 -> p2 = 10 -> unfair for p2

  const fairMargin = 10
  const isEqual = valuePlayer1 === valuePlayer2
  const isFairForPlayer1 = valuePlayer1 <= valuePlayer2 + fairMargin
  const isFairForPlayer2 = valuePlayer2 <= valuePlayer1 + fairMargin

  return isEqual || (isFairForPlayer1 && isFairForPlayer2)
}

const Home: React.FC = () => {
  const [pokemons, setPokemons] = useState([]);

  const [pokemonsDetails, setPokemonsDetails] = useState({});

  const [pokemonsPlayer1, setPokemonsPlayer1] = useState([]);
  const [pokemonsPlayer2, setPokemonsPlayer2] = useState([]);

  const [trades, setTrades] = useState<ITrade[]>([]);

  const fetchPokemons = useCallback(
    async () => {
      const { data } = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=2000')
      setPokemons(data.results.map(item => ({ value: item.url, label: item.name })))
    },
    [],
  )

  const fetchTrades = useCallback(async () => {
    const { data } = await axios.get('/api/trades')
    setTrades(data)
  }, [])

  const fetchPokemon = useCallback(async (url) => {
    if (pokemonsDetails[url]) {
      return pokemonsDetails[url]
    } else {
      const { data } = await axios.get(url)
      setPokemonsDetails({ ...pokemonsDetails, [url]: data })
      return data
    }
  }, [pokemonsDetails])

  const handlePlayerSelect2 = useCallback(async (option) => {
    const pokemon = await fetchPokemon(option.value)

    setPokemonsPlayer2(prevState => [...prevState, pokemon])
  }, [pokemonsDetails])

  const handlePlayerSelect1 = useCallback(async (option) => {
    const pokemon = await fetchPokemon(option.value)

    setPokemonsPlayer1(prevState => [...prevState, pokemon])
  }, [pokemonsDetails])

  const handleRemovePokemon1 = useCallback((indexRemove) => {
    setPokemonsPlayer1(prevState => prevState.filter((_, index) => indexRemove !== index))
  }, [])

  const handleRemovePokemon2 = useCallback((indexRemove) => {
    setPokemonsPlayer2(prevState => prevState.filter((_, index) => indexRemove !== index))
  }, [])

  const totalBaseExperiencePlayer1 = useMemo(() => {
    return pokemonsPlayer1.reduce((total, current) => total + current.base_experience, 0)
  }, [pokemonsPlayer1])

  const totalBaseExperiencePlayer2 = useMemo(() => {
    return pokemonsPlayer2.reduce((total, current) => total + current.base_experience, 0)
  }, [pokemonsPlayer2])

  const currentTradeIsFair = useMemo(() => {
    return tradeIsFair(totalBaseExperiencePlayer1, totalBaseExperiencePlayer2)
  }, [totalBaseExperiencePlayer1, totalBaseExperiencePlayer2]);

  const handleDoTrade = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    // save trade
    const { data } = await axios.post('/api/trades', {
      player1: pokemonsPlayer1,
      player2: pokemonsPlayer2
    })
    // update history
    setTrades([...trades, data])
    // clear lists
    setPokemonsPlayer1([]);
    setPokemonsPlayer2([])
  }, [trades, pokemonsPlayer1, pokemonsPlayer2])

  const tradesFormatted = useMemo(() => {
    return trades.map(trade => {
      const totalPlayer1 = trade.player1.reduce((total, curr) => total + curr.base_experience, 0)
      const totalPlayer2 = trade.player2.reduce((total, curr) => total + curr.base_experience, 0)
      return {
        ...trade,
        formatted_date: format(parseISO(trade.created_at), 'dd/MM/yyyy hh:mm'),
        is_fair: tradeIsFair(totalPlayer1, totalPlayer2),
        total_player_1: totalPlayer1,
        total_player_2: totalPlayer2,
      }
    })
  }, [trades])

  useEffect(() => {
    fetchPokemons()
    fetchTrades()
  }, [])

  return (
    <main className="container-fluid" style={{ maxWidth: 1400 }}>
      <Head>
        <title>Poke Trader | Nathan Souza</title>
      </Head>
      <div className="row">
        <div className="col-12 mt-3 mb-2 text-center">
          <h1>Poke Trader</h1>
          <p>Calcule se uma troca de pokémons é justa ou não</p>
        </div>
      </div>

      <form onSubmit={handleDoTrade} className="row">
        <div className="col-12 col-md-9">
          <div className="row">
            <div className="col-12 col-md-6">
              <PokemonSelector
                pokemons={pokemons}
                pokemonsOfPlayer={pokemonsPlayer1}
                totalBaseExperiencePlayer={totalBaseExperiencePlayer1}
                handlePokemonSelect={handlePlayerSelect1}
                handleRemovePokemon={handleRemovePokemon1}
              />
            </div>
            <div className="col-12 col-md-6">
              <PokemonSelector
                pokemons={pokemons}
                pokemonsOfPlayer={pokemonsPlayer2}
                totalBaseExperiencePlayer={totalBaseExperiencePlayer2}
                handlePokemonSelect={handlePlayerSelect2}
                handleRemovePokemon={handleRemovePokemon2}
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className={`card text-center card-body h-100 d-flex alert ${currentTradeIsFair ? 'alert-success' : 'alert-warning'}`}>
            <div className="my-auto">
              <p className="m-0">Resumo da troca</p>
              {pokemonsPlayer1.length === 0 || pokemonsPlayer2.length === 0 ? (
                <p>Os jogadores precisam selecionar pokémons</p>
              ) : (
                <>
                  <h1 className="mb-4">
                    {currentTradeIsFair
                      ? <span className="text-success">Justa</span>
                      : <span className="text-danger">Injusta</span>
                    }
                  </h1>
                  <button type="submit" className="btn btn-lg btn-primary">
                    Efetuar troca
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </form>

      <div className="row">
        <aside className="col-12 mt-4">
          <div className="card card-body border-0 text-secondary">
            <h3 className="text-center">Histórico</h3>
            <ul>
              {tradesFormatted.map(trade => (
                <li>
                  Player 1 ({trade.total_player_1}) / Player 2 ({trade.total_player_2}) - {trade.formatted_date} - {trade.is_fair ? 'Justa' : 'Injusta'}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

    </main>
  )
}

export default Home;
