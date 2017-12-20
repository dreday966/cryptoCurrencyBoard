import React, {Component} from 'react';
import {connect} from 'react-redux';
import './App.css';
import {getTickersForPro} from './fetch';
import {changeState} from './store';
import {VictoryPie} from 'victory';
import Combinatorics from 'js-combinatorics';
import {toPairs, sum} from 'ramda';
import {GreenBorderButton} from './GreenButton';
import {mapValues, set} from 'lodash';

const View = ({
  inputValues = [
    1, 2, 3
  ],
  prices = {},
  onChange = console.log,
  totalPrice = '1',
  onClickRefresh,
  victoryData,
  exchangeInfos = [],
  coinSymbols = [],
  onChangeNewCoinSymbol,
  inputingSymol,
  onClickAddSymbol
}) => (
  <div style={{
    padding: '20px'
  }}>
    <div>
    <GreenBorderButton
      onClick={onClickRefresh}
      style={{
        width: '100px',
        marginBottom: '10px'
      }}>
      刷新
    </GreenBorderButton>
    <input value={inputingSymol} onChange={onChangeNewCoinSymbol}/> 
    <button onClick={onClickAddSymbol}>添加新币</button>

    </div>
    

    <div style={{
      border: 'gray solid 1px',
      padding: '0px 8px'
    }}>
      {
        coinSymbols.map(symbol => (
          <div>
            <p> {symbol} 数量（单价：{prices[symbol]}元）</p>
            <input
              value={inputValues[symbol]}
              onChange={e => onChange({symbol, value: e.target.value})}
            />
          </div>
        ))
      }

      <p>总共：{totalPrice} 人民币</p>
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
  const {priceInfo, inputValues, symbols, inputingSymol} = state;

  if (priceInfo && inputValues && symbols) {

    const coinCounts = mapValues(inputValues, v => Number(v) || 0)

    var prices = symbols.reduce((acc, cur) => {
      return {
        ...acc,
        [cur]: priceInfo[cur].price_cny
      }
    }, {});
    
    var totalPrice = sum(
      symbols.map(symbol => 
        priceInfo[symbol].price_cny * coinCounts[symbol]
      )
    );

    ;

    var victoryData = symbols
    .filter(symbol => coinCounts[symbol] !== 0)
    .map(symbol => {
      const price = priceInfo[symbol].price_cny * coinCounts[symbol]
      return ({
        x: 0,
        y: price,
        label: `${symbol}: ${Math.round(price)}元`
      })
    });

    var exchangeInfos = symbols.length < 2 
      ? []
      : Combinatorics.permutation(symbols, 2)
      .toArray()
      .map(([s1, s2]) => `1 ${s1} = ${new Number(prices[s1] / prices[s2]).toFixed(8)} ${s2}`)
  };

  return {
    totalPrice, inputValues, prices, 
    victoryData, exchangeInfos, inputingSymol,
    coinSymbols: symbols
  }
}, {
  onChange: ({symbol, value}) => ({
    type: 'YO',
    payload: {
      inputValues: {
        [symbol]: value
      }
    }
  }),
  onClickRefresh: () => dispatch => {
    getTickersForPro()
    .then(priceInfo => dispatch({type: 'YO', payload: {
        priceInfo
      }}));
  },
  onChangeNewCoinSymbol: e => ({
    type: 'YO',
    payload: {
      inputingSymol: e.target.value
    }
  }),
  onClickAddSymbol: () => (dispatch, getState) => {
    
    const {symbols = [], inputingSymol} = getState();

    if (!symbols.find(e => e === inputingSymol)){
      dispatch({
        type: 'YO',
        payload: {
          symbols: [...symbols, inputingSymol]
        }
      });
    }

  }
})(View)

class Pro extends Component {

  componentWillMount() {
    this.props.onAppMount();
  }

  render() {
    return <ViewContainer/>;
  }
}

const ProContainer = connect(
  undefined,
  {
    onAppMount: () => (dispatch, getState) => {
      getTickersForPro().then(priceInfo => changeState({priceInfo}));
      if (getState().symbols === undefined){
        dispatch({
          type: 'YO',
          payload: {
            symbols: [
              'BTC',
              'ETH',
              'ADA'
            ]
          }
        })
      }
    }
  }
)(Pro)

export default ProContainer;
