import React, {Component} from 'react';
import {connect} from 'react-redux';
import logo from './logo.svg';
import './App.css';
import {getTickers} from './fetch';
import {changeState} from './store';
import {VictoryPie} from 'victory';

const View = ({
  inputValues = [1,2,3],
  prices = {},
  onChange = console.log,
  totalPrice = '1',
  onClickRefresh,
  victoryData
}) => (
  <div>
    <button onClick={onClickRefresh}>刷新</button>
    <div>
      <p>bitcoin 数量（单价：{prices.btc} 元）</p>
      <input value={inputValues[0]} onChange={e => onChange({index: 0, value: e.target.value})}/>
      
    </div>

    <div>
      <p>ada 数量（单价：{prices.ada} 元）</p>
      <input value={inputValues[1]} onChange={e => onChange({index: 1, value: e.target.value})}/>

    </div>

    <div>
      <p>eth 数量（单价：{prices.eth} 元）</p>
      <input value={inputValues[2]} onChange={e => onChange({index: 2, value: e.target.value})}/>
    </div>

    <p>总共：{totalPrice} 人民币</p>

    <VictoryPie 
      data={victoryData}
      colorScale="qualitative"
      labelRadius={70}
    />
  </div>
);

const ViewContainer = connect(
  state => {
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
      const [btcCount, adaCount, ethCount] = [
        inputValues[0],
        inputValues[1],
        inputValues[2],
      ].map(v => Number(v) || 0);

      var prices = {
        btc: btcPrice,
        eth: ethPrice,
        ada: adaPrice
      }
      
      var totalPrice = btcCount * btcPrice 
        + ethCount * ethPrice
        + adaCount * adaPrice;

      
      var victoryData = [
        {
          price: btcCount * btcPrice,
          name: 'btc'
        },
        {
          price: adaCount * adaPrice,
          name: 'ada'
        },
        {
          price: ethCount * ethPrice,
          name: 'eth'
        },
      ].filter(({price}) => price !== 0)
      .map(({name, price}) => ({
        x: 0, y: price, label: `${name}: ${Math.round(price)}元` 
      }));

      // var victoryData = [
      //   { x: 0, y: 1, label: "btc" },
      //   { x: 0, y: 3, label: "ada" },
      //   { x: 0, y: 2, label: "eth" },
      // ]
    }
    
    return {
      totalPrice, inputValues, prices, 
      victoryData
    }
  },
  {
    onChange: ({index, value}) => ({
      type: 'YO',
      payload: {
        inputValues: {
          [index]: value
        }
      }
    }),
    onClickRefresh: () => dispatch => {
      getTickers().then(priceInfo => dispatch({
        type: 'YO',
        payload: {priceInfo}
      }));
    }
  }
)(View)

class App extends Component {
  
    componentWillMount() {
      getTickers().then(priceInfo => changeState({priceInfo}));
    }
  
    render() {
      return <ViewContainer/>;
    }
  }

export default App;
