import {
  setUser,
} from "../actions"

const defaultState = {}

export default (state = defaultState, action) => {
  switch (action.type) {

    case setUser:
      return {
        ...state,
        [action.uid]: { cash: 0, level: 1, ...action.payload },
      }

    default:
      return state
  }
}
