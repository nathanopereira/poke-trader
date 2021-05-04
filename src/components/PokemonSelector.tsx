import React from 'react';
import Select from 'react-select';

interface IPokemonPlayer {
  name: string;
  base_experience: number;
  sprites: {
    front_default: string;
  }
}

interface IPokemonOption {
  value: string;
  label: string;
}
interface PokemonSelectorProps {
  pokemons: IPokemonOption[];
  isDisabled?: boolean;
  pokemonsOfPlayer: IPokemonPlayer[];
  totalBaseExperiencePlayer: number;
  handlePokemonSelect: (IPokemonOption) => void;
  handleRemovePokemon: (number) => void;
}

const PokemonSelector: React.FC<PokemonSelectorProps> = ({ pokemons, handlePokemonSelect, isDisabled, pokemonsOfPlayer, handleRemovePokemon, totalBaseExperiencePlayer }) => {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="mb-3">Jogador 1</h2>

        <label htmlFor="search-player-1">Selecionar pokémons</label>
        <Select
          options={pokemons}
          value={null}
          onChange={handlePokemonSelect}
          id="search-player-1"
          placeholder="Ex.: bulbasaur, pikachu"
          noOptionsMessage={() => "Nenhum resultado encontrado"}
          isDisabled={pokemonsOfPlayer.length === 6 || isDisabled}
        />

        {pokemonsOfPlayer.length === 6 && <small>Cada jogador pode adicionar apenas 6 pokémons.</small>}

        {pokemonsOfPlayer.length > 0 && (

          <ul className="list-unstyled mt-2">
            <li className="d-flex justify-content-between align-items-center pokemon-item">
              <small className="">Pokémon</small>
              <small className="">Experiência base</small>
            </li>
            {pokemonsOfPlayer.map((item, index) => (
              <li key={index} className="d-flex justify-content-between align-items-center pokemon-item">
                <div>
                  <img src={item.sprites.front_default} alt={item.name} height={40} />
                  {item.name}
                  <button disabled={isDisabled} className="border-0 text-danger bg-transparent" type="button" onClick={() => handleRemovePokemon(index)}><small>remover</small></button>
                </div>
                <div className="h4 m-0">
                  {item.base_experience}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pokemonsOfPlayer.length > 0 && (
        <div className="card-footer border-0 d-flex justify-content-between align-items-center">
          <p className="m-0">Total de experiência base</p>
          <strong className="h2 m-0">{totalBaseExperiencePlayer}</strong>
        </div>
      )}
    </section>
  );
}

export default PokemonSelector;
