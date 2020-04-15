import { combineReducers } from 'redux'
// import chatReducer from "./chat/reducer"
import authReducer from './auth/reducer'
import businessReducer from './business/reducer'

const reducers = combineReducers({
    // chatReducer,
    authReducer,
    businessReducer
})

export default reducers