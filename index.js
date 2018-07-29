import * as React from "react"
import { AppRegistry } from "react-native"

import codePush from "react-native-code-push"
import { Provider } from "react-redux"

import App from "./app/components/App"
import store from "./app/modules/ReduxStore"

class PushKing extends React.Component {
  componentDidMount() {
    codePush.notifyAppReady()
  }

  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
}

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE,
  updateDialog: {},
}
const CodePushified = codePush(codePushOptions)(PushKing)

AppRegistry.registerComponent("pushking", () => CodePushified)
