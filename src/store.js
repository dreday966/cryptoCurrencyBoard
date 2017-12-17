import {createStore, applyMiddleware, compose, combineReducers} from 'redux'
import thunkMiddleware from 'redux-thunk'
import {rootReducer} from './reducer'
import persistState from 'redux-localstorage'

const enhancer = compose(
  applyMiddleware(thunkMiddleware,),
  persistState(/*paths, config*/),
  window.devToolsExtension 
    ? window.devToolsExtension()
    : x => x
)

export const store = createStore(
  rootReducer, 
  enhancer
)

export const changeState = newState => store.dispatch({
  type: 'YO',
  payload: newState,
})