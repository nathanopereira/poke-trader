import axios from 'axios';
import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

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
    <main className="container">
      <div className="row">
        <div className="col-12 mt-3 mb-4"><h1 className="text-center">Poke Trader</h1></div>
      </div>

      <div className="row">
        <form className="col-12 col-md-8" onSubmit={handleDoTrade}>
          <div className="row">
            <div className="col-12 col-md-6">
              <section>
                <h2>Jogador 1</h2>

                <Select
                  options={pokemons}
                  value={null}
                  onChange={handlePlayerSelect1}
                  id="search-player-1"
                  placeholder="Ex.: bulbasaur, pikachu"
                  noOptionsMessage={() => "Nenhum resultado encontrado"}
                  isDisabled={pokemonsPlayer1.length === 6}
                />
                {pokemonsPlayer1.length === 6 && <small>Cada jogador pode adicionar apenas 6 pokémons.</small>}
                <ul>
                  {pokemonsPlayer1.map((item, index) => (
                    <li key={index}>
                      {item.name} <button type="button" onClick={() => handleRemovePokemon1(index)}>remover</button>
                    </li>
                  ))}
                </ul>

                <div>
                  <p>Experiência base</p>
                  <strong>{totalBaseExperiencePlayer1}</strong>
                </div>
              </section>
            </div>
            <div className="col-12 col-md-6">
              <section>
                <h2>Jogador 2</h2>

                <Select
                  options={pokemons}
                  value={null}
                  onChange={handlePlayerSelect2}
                  id="search-player-1"
                  placeholder="Ex.: bulbasaur, pikachu"
                  noOptionsMessage={() => "Nenhum resultado encontrado"}
                  isDisabled={pokemonsPlayer2.length === 6}
                />
                {pokemonsPlayer2.length === 6 && <small>Cada jogador pode adicionar apenas 6 pokémons.</small>}
                <ul>
                  {pokemonsPlayer2.map((item, index) => (
                    <li key={index}>{item.name} <button type="button" onClick={() => handleRemovePokemon2(index)}>remover</button></li>
                  ))}
                </ul>

                <div>
                  <p>Experiência base</p>
                  <strong>{totalBaseExperiencePlayer2}</strong>
                </div>
              </section>
            </div>
          </div>



          <div>
            <h3>Resumo da troca</h3>{pokemonsPlayer1.length === 0 || pokemonsPlayer2.length === 0 ? (
              <p>Os jogadores precisam selecionar pokémons</p>
            ) : (
              <>
                <p>{currentTradeIsFair ? 'Justa' : 'Injusta'}</p>
                <button type="submit">
                  Efetuar troca
                </button>
              </>
            )}
          </div>
        </form>

        <aside className="col-12 col-md-4">
          <h3>Histórico</h3>
          <ul>
            {tradesFormatted.map(trade => (
              <li>
                Player 1 ({trade.total_player_1}) / Player 2 ({trade.total_player_2}) <br />
                {trade.formatted_date} - {trade.is_fair ? 'Justa' : 'Injusta'}
              </li>
            ))}
          </ul>
        </aside>
      </div>

    </main>
  )
}

export default Home;
