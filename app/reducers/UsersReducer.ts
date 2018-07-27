import {
  setUser,
} from "../actions"

const defaultState = {}

export default (state = defaultState, action) => {
  switch (action.type) {

    case setUser:
      return {
        ...state,
        [action.uid]: action.payload,
      }

    default:
      return state
  }
}
