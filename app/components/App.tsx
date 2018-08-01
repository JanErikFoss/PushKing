import * as React from "react"
import { StyleSheet, View, YellowBox, ActivityIndicator, StatusBar, Alert } from "react-native"
import * as T from "../types"

import { connect } from "react-redux"
import { setUser } from "../actions"

import Main from "./Main"

import { auth, fs } from "../modules/Firebase"
import Notifications from "../modules/Notifications"

export interface Props {
  users: { [uid: string]: T.User },
  setUser: (uid: string, user: Object) => void,
}

interface State {
  loggedIn: boolean,
}

export class AppComponent extends React.Component<Props, State> {
  state = { loggedIn: false }

  async componentDidMount() {
    YellowBox.ignoreWarnings([
      "Remote debugger is in a background tab",
    ])

    Notifications.init()

    auth().onAuthStateChanged((user: any) => this.setState({ loggedIn: !!user }))
    auth().signInAnonymouslyAndRetrieveData()
      .then(res => console.log("Logged in, uid: ", res.user.uid))
      .then(() => fs().doc("users/" + auth().currentUser.uid).get())
      .then(doc => this.props.setUser(doc.id, doc.data() as T.User))
      .catch(err => {
        console.log("Failed to sign in: ", err)
        Alert.alert("Something went wrong", err.message)
      })
  }

  componentWillUnmount() {
    Notifications.unmount()
  }

  render() {
    const uid = auth().currentUser && auth().currentUser.uid
    const user = uid && this.props.users[uid]

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        {this.state.loggedIn && user ? (
          <Main />
        ) : (
          <ActivityIndicator size="large" color="white" />
        )}
      </View>
    )
  }
}

const mapStateToProps = (state, props) => ({
  users: state.users,
})
const mapDispatchToProps = dispatch => ({
  setUser: (uid, user) => dispatch({ uid, payload: user, type: setUser }),
})
export default connect(mapStateToProps, mapDispatchToProps)(AppComponent)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9b59b6",
  },
})
