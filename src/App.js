import React, {Component} from 'react';
import {connect} from 'react-redux';
import logo from './logo.svg';
import './App.css';
import {getTickers} from './fetch';
import {changeState} from './store';
import {VictoryPie} from 'victory';
import Combinatorics from 'js-combinatorics';
import {toPairs} from 'ramda';
import {GreenBorderButton} from './GreenButton';

const View = ({
  inputValues = [
    1, 2, 3
  ],
  prices = {},
  onChange = console.log,
  totalPrice = '1',
  onClickRefresh,
  victoryData,
  exchangeInfos = []
}) => (
  <div style={{
    padding: '20px'
  }}>
    <GreenBorderButton
      onClick={onClickRefresh}
      style={{
        width: '100px',
        marginBottom: '10px'
      }}>
      刷新
    </GreenBorderButton>
    <div style={{
      border: 'gray solid 1px',
      padding: '0px 8px'
    }}>
      <div>
        <p>bitcoin 数量（单价：{prices.btc}
          元）</p>
        <input
          value={inputValues[0]}
          onChange={e => onChange({index: 0, value: e.target.value})}/>

      </div>

      <div>
        <p>ada 数量（单价：{prices.ada}
          元）</p>
        <input
          value={inputValues[1]}
          onChange={e => onChange({index: 1, value: e.target.value})}/>

      </div>

      <div>
        <p>eth 数量（单价：{prices.eth}
          元）</p>
        <input
          value={inputValues[2]}
          onChange={e => onChange({index: 2, value: e.target.value})}/>
      </div>

      <p>总共：{totalPrice}
        人民币</p>
    </div>

    <VictoryPie data={victoryData} colorScale="qualitative" labelRadius={70}/>

    <div style={{
      border: 'gray solid 1px',
      padding: '0px 8px'
    }}>
      <p>汇率换算</p>
      <ul>
        {exchangeInfos.map(info => <li>{info}</li>)
}
      </ul>
    </div>
  </div>
);

const ViewContainer = connect(state => {
  const {priceInfo, inputValues} = state;

  if (priceInfo && inputValues) {
    var {
      bitcoin: {
        price_cny: btcPrice
      },
      ethereum: {
        price_cny: ethPrice
      },
      cardano: {
        price_cny: adaPrice
      }
    } = priceInfo;
    const [btcCount,
      adaCount,
      ethCount] = [inputValues[0], inputValues[1], inputValues[2]].map(v => Number(v) || 0);

    var prices = {
      btc: btcPrice,
      eth: ethPrice,
      ada: adaPrice
    }

    var totalPrice = btcCount * btcPrice + ethCount * ethPrice + adaCount * adaPrice;

    var victoryData = [
      {
        price: btcCount * btcPrice,
        name: 'btc'
      }, {
        price: adaCount * adaPrice,
        name: 'ada'
      }, {
        price: ethCount * ethPrice,
        name: 'eth'
      }
    ].filter(({price}) => price !== 0).map(({name, price}) => ({
      x: 0,
      y: price,
      label: `${name}: ${Math.round(price)}元`
    }));

    var exchangeInfos = Combinatorics.permutation(toPairs(prices), 2)
      .toArray()
      .map(([
        [
          n1, p1
        ],
        [n2, p2]
      ]) => `1 ${n1} = ${new Number(p1 / p2).toFixed(8)} ${n2}`)
  }

  return {totalPrice, inputValues, prices, victoryData, exchangeInfos}
}, {
  onChange: ({index, value}) => ({
    type: 'YO',
    payload: {
      inputValues: {
        [index]: value
      }
    }
  }),
  onClickRefresh: () => dispatch => {
    getTickers().then(priceInfo => dispatch({type: 'YO', payload: {
        priceInfo
      }}));
  }
})(View)

class App extends Component {

  componentWillMount() {
    getTickers().then(priceInfo => changeState({priceInfo}));
  }

  render() {
    return <ViewContainer/>;
  }
}

export default App;
