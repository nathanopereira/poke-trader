import React from 'react';
import Select from 'react-select';

const PokemonSelector: React.FC = ({ pokemons, handlePokemonSelect, pokemonsOfPlayer, handleRemovePokemon, totalBaseExperiencePlayer }) => {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="mb-3">Jogador 1</h2>

        <label htmlFor="search-player-1">Pesquisar pokemons</label>
        <Select
          options={pokemons}
          value={null}
          onChange={handlePokemonSelect}
          id="search-player-1"
          placeholder="Ex.: bulbasaur, pikachu"
          noOptionsMessage={() => "Nenhum resultado encontrado"}
          isDisabled={pokemonsOfPlayer.length === 6}
        />

        {pokemonsOfPlayer.length === 6 && <small>Cada jogador pode adicionar apenas 6 pokémons.</small>}

        <ul className="list-unstyled">
          {pokemonsOfPlayer.map((item, index) => (
            <li key={index} className="d-flex justify-content-between align-items-center pokemon-item">
              <div>
                <img src={item.sprites.front_default} alt={item.name} height={40} />
                {item.name}
                <button className="border-0 text-danger bg-transparent" type="button" onClick={() => handleRemovePokemon(index)}><small>remover</small></button>
              </div>
              <div className="h4 m-0">
                {item.base_experience}
              </div>
            </li>
          ))}
        </ul>
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
