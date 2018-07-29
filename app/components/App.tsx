import * as React from "react"
import { StyleSheet, Text, View, YellowBox, ActivityIndicator } from "react-native"

import Main from "./Main"

import { auth, fs } from "../modules/Firebase"
import Notifications from "../modules/Notifications"

export interface Props {
}

interface State {
  loggedIn: boolean
}

export default class App extends React.Component<Props, State> {
  state = { loggedIn: false }

  async componentDidMount() {
    YellowBox.ignoreWarnings([
      "Remote debugger is in a background tab",
    ])

    Notifications.init()

    auth().onAuthStateChanged((user: any) => this.setState({ loggedIn: !!user }))
    auth().signInAnonymouslyAndRetrieveData()
      .then(res => console.log("Logged in, uid: ", res.user.uid))
      .catch(err => console.log("Failed to sign in: ", err))
  }

  componentWillUnmount() {
    Notifications.unmount()
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.loggedIn ? (
          <Main />
        ) : (
          <ActivityIndicator size="large" color="white" />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9b59b6",
  },
})
