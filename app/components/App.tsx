import * as React from "react"
import { StyleSheet, Text, View } from "react-native"

import { auth, fs, notifications, messaging } from "../modules/Firebase"
import Notifications from "../modules/Notifications"

export interface Props {
}

interface State {
  loggedIn: boolean
}

export default class App extends React.Component<Props, State> {
  state = { loggedIn: false }

  async componentDidMount() {
    Notifications.init()

    auth().onAuthStateChanged((user: any) => {
      this.setState({ loggedIn: !!user })
    })

    auth().signInAnonymouslyAndRetrieveData()
      .then(() => console.log("Signed in"))
      .catch(err => console.log("Failed to sign in: ", err))
  }

  componentWillUnmount() {
    Notifications.unmount()
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.loggedIn ? (
          <Text>{auth().currentUser!.uid}</Text>
        ) : (
          <Text>Hello world</Text>
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
  },
})
