import { keyBy } from 'lodash';

export const getTickers = () => 
  fetch('https://api.coinmarketcap.com/v1/ticker/?convert=CNY')
    .then(res => res.json())
    .then(arr => keyBy(arr, 'id'));
