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
import { PureDialog } from './PureDialog';

const CoinAllocationInput = ({
  coinSymbols = [], 
  inputingRMBValue,
  onChangeRMB,
  inputValues = {},
  onChangeCoinValue,
  prices,
  showPrices = true
}) => (
  <div>
    <div>
          <p> 持有人民币数量 </p>
          <input
            value={inputingRMBValue}
            onChange={e => onChangeRMB(e.target.value)}
          />
      </div>
    {
      coinSymbols.map(symbol => (
        <div>
          <p> {symbol} 数量 {showPrices && `（单价：${prices[symbol]}元）`} </p>
          <input
            value={inputValues[symbol]}
            onChange={e => onChangeCoinValue({symbol, value: e.target.value})}
          />
        </div>
      ))
    }
  </div>  
);

const BorderDiv = ({style, ...props}) => (
  <div style={{
    border: 'gray solid 1px',
    padding: '0px 8px',
    ...style
  }} {...props}/>
);

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
  onClickAddSymbol,
  inputingRMBValue,
  onChangeRMB,
  showAdd,
  onClickShowAdd,
  onClickHideAdd
}) => (
  <div>
    <div>
    <GreenBorderButton
      onClick={onClickRefresh}
      style={{
        width: '100px',
        marginBottom: '10px'
      }}>
      刷新
    </GreenBorderButton>

    </div>
    

    <div style={{
      border: 'gray solid 1px',
      padding: '0px 8px'
    }}>
      <p>总共价值：{totalPrice} 人民币</p>
      <div>
            <p> 持有人民币数量 </p>
            <input
              value={inputingRMBValue}
              onChange={e => onChangeRMB(e.target.value)}
            />
          </div>
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

      
    </div>
    <div>
      {
        showAdd ? (
          <div style={{
            border: 'gray solid 1px',
            padding: '8px',
            margin: '10px 0px'
          }}>
            <button onClick={onClickHideAdd}> 关闭 </button>
            <input value={inputingSymol} onChange={onChangeNewCoinSymbol}/>
            <button onClick={onClickAddSymbol}>添加新币</button>
          </div>
        ) : (
          <button onClick={onClickShowAdd}> + </button>
        )
      }
      
    </div>

    <VictoryPie data={victoryData} colorScale="qualitative" labelRadius={70}/>

    <div style={{
      border: 'gray solid 1px',
      padding: '0px 8px'
    }}>
      <p>汇率换算</p>
      <ul>
        {exchangeInfos.map(info => <li>{info}</li>)}
      </ul>
    </div>
  </div>
);

const OldAllocations = ({data, onClickAdd}) => (
  <BorderDiv style={{marginTop: '10px'}}>
    <h2>之前分配方案的现在价值</h2>
    <div style={{margin: '10px 0px'}}>
      <button onClick={onClickAdd}>添加方案</button>

    </div>
    {
      data.map(({des, value}) => 
        <p>
          {des} <br/>
          {value}
        </p>
      )
    }
  </BorderDiv>
);

const OldAllocationsContainer = connect(
  state => {
    const {oldAllocations, priceInfo, symbols} = state
    const prices = getPrices(priceInfo, symbols);

    
    return {
      data: oldAllocations.map((counts, index) => {
        const total = sum(
          symbols.map(s => prices[s] * counts[s])
        );
  
        return {
          des: `老方案${index + 1}`,
          value: total,
        }
      })
    }
  },
  {
    onClickAdd: () => ({
      type: 'YO',
      payload: {
        addOldAllocationDialog: {
          show: true
        }
      }
    }),
  }
)(OldAllocations);

const getPrices = (priceInfo, symbols) => symbols.reduce((acc, cur) => {
  return {
    ...acc,
    [cur]: priceInfo[cur].price_cny
  }
}, {});

const ViewContainer = connect(state => {
  const {
    priceInfo, inputValues, symbols, 
    inputingSymol, inputingRMBValue,
    showAdd
  } = state;

  if (priceInfo && inputValues && symbols && inputingRMBValue) {

    const coinCounts = mapValues(inputValues, v => Number(v) || 0)

    var prices = getPrices(priceInfo, symbols);
    
    var totalPrice = sum(
      symbols.map(symbol => 
        priceInfo[symbol].price_cny * coinCounts[symbol]
      )
    ) + Number(inputingRMBValue);

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
    coinSymbols: symbols, showAdd, inputingRMBValue
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
  },
  onChangeRMB: value => ({
    type: 'YO',
    payload: {
      inputingRMBValue: value
    }
  }),
  onClickShowAdd: value => ({
    type: 'YO',
    payload: {
      showAdd: true
    }
  }),
  onClickHideAdd: value => ({
    type: 'YO',
    payload: {
      showAdd: false
    }
  }),
})(View);


const AddOldAllocationDialog = ({
  show,
  onClose,
  onClickConfirm,
  ...restProps
}) => (
  show && (
    <PureDialog 
      showClose
      style={{
        background: 'white',
        padding: '40px'
      }}
      onClose={onClose}
      >
      <CoinAllocationInput
        showPrices={false} 
        {...restProps}
      />
      <button style={{marginTop: '10px'}} onClick={onClickConfirm}>确认</button>
    </PureDialog>
  )
);

const AddOldAllocationDialogContainer = connect(
  state => {
    const {
      symbols, addOldAllocationDialog
    } = state;

    if (addOldAllocationDialog){
      var {inputingRMBValue, inputValues, show} = addOldAllocationDialog;
    }
    return {
      coinSymbols: symbols, 
      inputingRMBValue, inputValues,
      show
    }
  },
  {
    onChangeCoinValue: ({symbol, value}) => ({
      type: 'YO',
      payload: {
        addOldAllocationDialog: {
          inputValues: {
            [symbol]: value
          }
        }
      }
    }),
    onChangeRMB: value => ({
      type: 'YO',
      payload: {
        addOldAllocationDialog: {
          inputingRMBValue: value
        }
      }
    }),
    onClose: () => ({
      type: 'YO',
      payload: {
        addOldAllocationDialog: {
          show: false
        }
      }
    }),
    onClickConfirm: () => (dispatch, getState) => {
      const {priceInfo, oldAllocations, symbols, addOldAllocationDialog} = getState();
      
      const coinCounts = {
        ...mapValues(addOldAllocationDialog.inputValues, v => Number(v) || 0),
        CNY: Number(addOldAllocationDialog.inputingRMBValue) || 0 
      };

      dispatch({
        type: 'YO',
        payload: {
          oldAllocations: oldAllocations 
            ? [...oldAllocations, coinCounts]
            : [coinCounts]
        }
      });
        
    }
  }
)(AddOldAllocationDialog);


class Pro extends Component {

  componentWillMount() {
    this.props.onAppMount();
  }

  render() {
    return <div style={{
      padding: '20px'
    }}>
      <ViewContainer/>
      <AddOldAllocationDialogContainer/>
      <OldAllocationsContainer/>
    </div>
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
