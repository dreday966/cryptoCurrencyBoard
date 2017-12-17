import {combineReducers} from 'redux'
import {mergeDeepRight} from 'ramda'

export const rootReducer = (state = {}, action) => {
  return action.type === 'YO'
    ? mergeDeepRight(state, action.payload)
    : state;
};


