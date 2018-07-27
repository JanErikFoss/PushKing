import * as React from "react"
import { AppRegistry } from "react-native"

import { Provider } from "react-redux"

import App from "./app/components/App"
import store from "./app/modules/ReduxStore"

class PushKing extends React.Component {
  componentDidMount() {
    // codePush.notifyAppReady()
  }

  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
}

AppRegistry.registerComponent("pushking", () => PushKing);
