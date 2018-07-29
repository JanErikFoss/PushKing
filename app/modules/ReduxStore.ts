import { createStore, combineReducers, applyMiddleware } from "redux"
import { createLogger } from "redux-logger"

import UsersReducer from "../reducers/UsersReducer"
import AttacksReducer from "../reducers/AttacksReducer"

const LOG_REDUX = false && __DEV__
// const USE_STORAGE = true

// Combine all reducers
const reducer = combineReducers({
  users: UsersReducer,
  attacks: AttacksReducer,
})

// Logger
const loggerMiddleware = createLogger({})

// Get middlewares
const middleware = [
  LOG_REDUX && __DEV__ && loggerMiddleware,
].filter(Boolean)

// Create store
const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore)
const store = createStoreWithMiddleware(reducer)

export default store
