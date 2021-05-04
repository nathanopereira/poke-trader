import axios from 'axios';
import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import Head from 'next/head';
import { ToastContainer, toast } from 'react-toastify';

import PokemonSelector from '@/components/PokemonSelector'

interface PokemonPlayer {
  name: string;
  base_experience: number;
  sprites: {
    front_default: string;
  }
}
interface ITrade {
  _id: string;
  player1: PokemonPlayer[],
  player2: PokemonPlayer[],
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
  const [pokemons, setPokemons] = useState<{value: string; label: string}[]>([]);

  const [pokemonsDetails, setPokemonsDetails] = useState({});

  const [pokemonsPlayer1, setPokemonsPlayer1] = useState([]);
  const [pokemonsPlayer2, setPokemonsPlayer2] = useState([]);

  const [trades, setTrades] = useState<ITrade[]>([]);
  const [isSavingTrade, setIsSavingTrade] = useState(false)
  const [isLoadingTrades, setIsLoadingTrades] = useState(false)

  const fetchPokemons = useCallback(
    async () => {
      const { data } = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=2000')
      setPokemons(data.results.map(item => ({ value: item.url, label: item.name })))
    },
    [],
  )

  const fetchTrades = useCallback(async () => {
    setIsLoadingTrades(true)
    const { data } = await axios.get('/api/trades')
    setTrades(data)
    setIsLoadingTrades(false)
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
    const {name, base_experience, sprites} = await fetchPokemon(option.value)

    setPokemonsPlayer2(prevState => [...prevState, {name, base_experience, sprites, url: option.value}])
  }, [pokemonsDetails])

  const handlePlayerSelect1 = useCallback(async (option) => {
    const {name, base_experience, sprites} = await fetchPokemon(option.value)

    setPokemonsPlayer1(prevState => [...prevState, {name, base_experience, sprites, url: option.value}])
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

  const differenceTotalBaseExperience = useMemo(() => {
    return Math.abs(totalBaseExperiencePlayer1 - totalBaseExperiencePlayer2)
  },[totalBaseExperiencePlayer1, totalBaseExperiencePlayer2])

  const currentTradeIsFair = useMemo(() => {
    return tradeIsFair(totalBaseExperiencePlayer1, totalBaseExperiencePlayer2)
  }, [totalBaseExperiencePlayer1, totalBaseExperiencePlayer2]);

  const handleDoTrade = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    setIsSavingTrade(true)
    try{
      // save trade
      const { data } = await axios.post('/api/trades', {
        player1: pokemonsPlayer1,
        player2: pokemonsPlayer2
      })
      // update history
      setTrades([...trades, {...data, recent: true}])
      // clear lists
      setPokemonsPlayer1([]);
      setPokemonsPlayer2([]);

      toast.success("Troca salva com sucesso!")
    }catch(err){
      console.error(err)
      toast.error("Erro ao salvar! Por favor tente novamente")
    }finally{
      setIsSavingTrade(false)
    }
  }, [trades, pokemonsPlayer1, pokemonsPlayer2])

  const tradesFormatted = useMemo(() => {
    return trades.map(trade => {
      const totalPlayer1 = trade.player1.reduce((total, curr) => total + curr.base_experience, 0)
      const totalPlayer2 = trade.player2.reduce((total, curr) => total + curr.base_experience, 0)
      return {
        ...trade,
        formatted_date: format(parseISO(trade.created_at), 'dd/MM/yyyy HH:mm'),
        is_fair: tradeIsFair(totalPlayer1, totalPlayer2),
        total_player_1: totalPlayer1,
        total_player_2: totalPlayer2,
      }
    }).sort((a, b) => {
      return parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
    })
  }, [trades])

  useEffect(() => {
    fetchPokemons()
    fetchTrades()
  }, [])

  return (
    <main className="container-fluid" style={{ maxWidth: 1400 }}>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
        <title>Poke Trader | Nathan Souza</title>
      </Head>
      <div className="row">
        <div className="col-12 col-md-8 mx-auto my-4 text-center mb-3">
          <h1 className="m-0">Poke Trader</h1>
          <p>Poke Trader é uma calculadora de trocas de pokémons que permite calcular se uma troca entre jogadores é justa ou não a partir da soma e comparação da experiência base (base_experience) dos pokémons dos jogadores. Também permite armazenar e consultar o histórico de trocas calculadas.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-9">
          <div className="row">
            <div className="col-12 col-md-6 text-center my-3">
              1. Selecione os pokémons que o Jogador 1 deseja trocar.
            </div>
            <div className="col-12 col-md-6 text-center my-3">
              2. Selecione os pokémons que o Jogador 2 deseja trocar.
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3 text-center my-3">
          3. Confira se a troca é justa ou não e salve.
        </div>
      </div>

      <form onSubmit={handleDoTrade} className="row">
        <div className="col-12 col-md-9">
          <div className="row">
            <div className="col-12 col-md-6">
              <PokemonSelector
                title="Jogador 1"
                pokemons={pokemons}
                isDisabled={isSavingTrade}
                pokemonsOfPlayer={pokemonsPlayer1}
                totalBaseExperiencePlayer={totalBaseExperiencePlayer1}
                handlePokemonSelect={handlePlayerSelect1}
                handleRemovePokemon={handleRemovePokemon1}
                />
            </div>
            <div className="col-12 col-md-6">
              <PokemonSelector
                title="Jogador 2"
                pokemons={pokemons}
                isDisabled={isSavingTrade}
                pokemonsOfPlayer={pokemonsPlayer2}
                totalBaseExperiencePlayer={totalBaseExperiencePlayer2}
                handlePokemonSelect={handlePlayerSelect2}
                handleRemovePokemon={handleRemovePokemon2}
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className={`card px-3 text-center card-body h-100 d-flex alert ${
            (pokemonsPlayer1.length > 0 && pokemonsPlayer2.length > 0) ? currentTradeIsFair ? 'alert-success' : 'alert-warning' : 'alert-secondary'
            }`}>
            <div className="my-auto">
              <p className="m-0 font-weight-bold">Resumo da troca</p>
              {pokemonsPlayer1.length === 0 || pokemonsPlayer2.length === 0 ? (
                <span>Selecione pokémons para ver o resumo da troca</span>
              ) : (
                <>
                  <small className="d-block p-2">
                    A diferença entre o total da experiência base é de <strong>{differenceTotalBaseExperience} pontos</strong>
                  </small>
                  <h1 className="mb-3">
                    {currentTradeIsFair
                      ? <span className="text-success">Justa</span>
                      : <span className="text-danger">Injusta</span>
                    }
                  </h1>
                  <button type="submit" className="btn btn-lg btn-primary" disabled={isSavingTrade}>
                    {isSavingTrade ? 'Salvando...' : 'Salvar troca'}
                  </button>
                </>
              )}
              <div className="mt-3">
                <small className="d-block"><strong>Troca Justa</strong>: até 10 pontos de diferença.</small>
                <small className="d-block"><strong>Troca Injusta</strong>: mais de 10 pontos de diferença.</small>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="row">
        <aside className="col-12 col-md-9 mx-auto mt-4">
          <div className="card card-body border-0 text-secondary">
            <h3 className="text-center">Histórico</h3>
            {isLoadingTrades && <p className="my-3 text-center">Carregando...</p>}
            {!isLoadingTrades && (
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th colSpan={2}>Jogador 1</th>
                      <th colSpan={2}>Jogador 2</th>
                      <th>Resumo da troca</th>
                    </tr>
                  </thead>
                  {tradesFormatted.map(trade => (
                    <tr>
                      <td>
                      {trade.formatted_date}
                      </td>
                      <td>
                        {trade.player1.map(item => (
                          <img className="img-thumbnail mr-1" src={item.sprites?.front_default} alt={item.name} title={item.name} width={40} />
                          ))}
                      </td>
                      <td>{trade.total_player_1}</td>
                      <td>
                        {trade.player2.map(item => (
                          <img className="img-thumbnail mr-1" src={item.sprites?.front_default} alt={item.name} title={item.name} width={40} />
                          ))}
                      </td>
                      <td>{trade.total_player_2}</td>
                      <td>
                        {trade.is_fair ? <span className="text-success">Justa</span> : <span className="text-danger">Injusta</span>}
                      </td>
                    </tr>
                  ))}
                </table>
              </div>
            )}
          </div>
        </aside>
        <div className="col-12 text-center mt-3">
          <small>Desenvolvido por <a href="https://github.com/nathanopereira/poke-trader" target="_blank">@nathanopereira</a></small>
        </div>
      </div>

      <ToastContainer />
    </main>
  )
}

export default Home;
