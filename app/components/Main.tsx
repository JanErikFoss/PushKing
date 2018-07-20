import * as React from "react"
import { StyleSheet, Text, View, Alert } from "react-native"

import { auth, fs } from "../modules/Firebase"

export interface Props {
}

interface State {
  cash: number
}

export default class App extends React.Component<Props, State> {
  state = { cash: 0 }
  cashListener = null
  attackListener = null

  async componentDidMount() {
    this.attackListener = fs().collection("attacks")
      .where("defender", "==", auth().currentUser.uid)
      .onSnapshot(qss => qss.docs.forEach(this.onAttack))

    this.cashListener = fs().doc("users/" + auth().currentUser.uid)
      .onSnapshot(this.onNewUserData)
  }

  onNewUserData = async doc => {
    const data = doc.exists && doc.data()
    if (!data) return console.log("User data missing")

    this.setState({ cash: data.cash })
  }

  onAttack = async doc => {
    const data = doc.exists && doc.data()
    if (!data) return console.log("Attack doc has been deleted")
    console.log("Attack doc: ", data)

    const timeLeft = data.timestamp
      ? Date.now() - data.timestamp
      : "Unknown"

    console.log("Time left on attack from " + data.attacker)

    try {
      await fs().doc("attacks/" + doc.id).update({ defended: true })
      console.log("Successfully defended attack from " + data.attacker)
    } catch (err) {
      console.log("Failed to upload \"defended: true\": ", err)
      Alert.alert("Something went wrong", "Failed to upload defend command")
    }
  }

  componentWillUnmount() {
    this.attackListener && this.attackListener()
    this.cashListener && this.cashListener()
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{"Cash: " + (this.state.cash || 0)}</Text>
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
