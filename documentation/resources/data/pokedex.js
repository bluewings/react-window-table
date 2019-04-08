const { pokemons } = require('./pokedex.json');

const columns = pokemons.reduce((prev, e) => [...prev, ...Object.keys(e)], []).filter((v, i, a) => a.indexOf(v) === i);

const rows = pokemons;

export { columns, rows };
