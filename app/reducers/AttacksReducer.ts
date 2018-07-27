import {
  setIncomingAttack,
  setOutgoingAttack,
} from "../actions"

const defaultState = {
  incoming: {},
  outgoing: {},
}

export default (state = defaultState, action) => {
  switch (action.type) {

    case setIncomingAttack:
      return {
        outgoing: state.outgoing,
        incoming: {
          ...state.incoming,
          [action.uid]: action.payload,
        }
      }

    case setOutgoingAttack:
      return {
        incoming: state.incoming,
        outgoing: {
          ...state.outgoing,
          [action.uid]: action.payload,
        }
      }

    default:
      return state
  }
}
