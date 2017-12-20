import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Pro from './Pro';
import registerServiceWorker from './registerServiceWorker';
import { store } from './store';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'


ReactDOM.render(
  <Provider store={store}>
    <Router>
      <div>
        <Route exact path="/" component={App}/>
        <Route path="/pro" component={Pro}/>
      </div>
    </Router>
  </Provider>, 
  document.getElementById('root')
);
registerServiceWorker();
