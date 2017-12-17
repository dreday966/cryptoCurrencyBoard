import React, {Component} from 'react';
import {connect} from 'react-redux';
import logo from './logo.svg';
import './App.css';
import {getTickers} from './fetch';
import {changeState} from './store';



const View = ({
  inputValues = [1,2,3],
  onChange = console.log,
  totalPrice = '1'
}) => (
  <div>
    <div>
      <p>bitcoin count</p>
      <input value={inputValues[0]} onChange={e => onChange({index: 0, value: e.target.value})}/>

    </div>

    <div>
      <p>ada count</p>
      <input value={inputValues[1]} onChange={e => onChange({index: 1, value: e.target.value})}/>

    </div>

    <div>
      <p>eth count</p>
      <input value={inputValues[2]} onChange={e => onChange({index: 2, value: e.target.value})}/>
    </div>

    <p>总共：{totalPrice} 人民币</p>
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
      
      var totalPrice = btcCount * btcPrice 
        + ethCount * ethPrice
        + adaCount * adaPrice
    }
    
    return {
      totalPrice, inputValues
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
    })
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
