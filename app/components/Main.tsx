import * as React from "react"
import { StyleSheet, Text, View, Alert, Dimensions, Platform, TextInput, StatusBar, TouchableHighlight } from "react-native"

import { connect } from "react-redux"
import { setUser, setIncomingAttack, setOutgoingAttack } from "../actions"

import List from "./List"

import { auth, fs, functions } from "../modules/Firebase"
const attack = functions().httpsCallable("attack")

export interface Props {
  user: Object,
  users: Object[],
  setUser: (uid: string, user: Object) => void,
  setIncomingAttack: (attack: Object) => void,
  setOutgoingAttack: (attack: Object) => void,
}

interface State {
}

const NICKNAME_UPDATE_DELAY = 1 * 1000

class MainComponent extends React.Component<Props, State> {
  state = {}
  incomingAttackListener = null
  outgoingAttackListener = null
  usersListener = null
  nicknameUpdateTimeout = null

  componentDidMount() {
    this.setIncomingAttackListener(null)
    this.setOutgoingAttackListener(null)
    this.setUsersListener(null)
  }

  setIncomingAttackListener = err => {
    if (err) console.log("Error in attack listener: ", err)
    this.incomingAttackListener && this.incomingAttackListener()
    this.incomingAttackListener = fs().collection("attacks")
      .where("defender", "==", auth().currentUser.uid)
      .where("state", "==", "started")
      .onSnapshot(qss => qss.docs.forEach(this.onIncomingAttack), this.setIncomingAttackListener)
  }
  setOutgoingAttackListener = err => {
    if (err) console.log("Error in attack listener: ", err)
    this.outgoingAttackListener && this.outgoingAttackListener()
    this.outgoingAttackListener = fs().collection("attacks")
      .where("attacker", "==", auth().currentUser.uid)
      .where("state", "==", "started")
      .onSnapshot(qss => qss.docs.forEach(this.onOutgoingAttack), this.setOutgoingAttackListener)
  }

  setUsersListener = err => {
    if (err) console.log("Error in users listener: ", err)
    this.usersListener && this.usersListener()
    this.usersListener = fs().collection("users").onSnapshot(this.onUsers, this.setUsersListener)
  }
  onUsers = qss => {
    qss.docChanges.forEach(change => {
      const doc = change._document
      if (doc.id === auth().currentUser.uid) {
        this.setState({ nickname: doc.data().nickname })
      }

      if (change.type === "modified") return this.props.setUser(doc.id, doc.data())
      if (change.type === "added") return this.props.setUser(doc.id, doc.data())
      if (change.tyoe === "removed") return this.props.setUser(doc.id, null)
    })
  }

  onAttack = doc => {
    const data = doc.exists && doc.data()
    if (!data) return console.log("Attack doc has been deleted")
    if (!data.defender || !data.attacker) return console.log("Missing attack data")
    return { ...data, attackId: doc.id }
  }

  onIncomingAttack = doc => {
    const attackObj = this.onAttack(doc)
    console.log("Incoming attack: ", attackObj)
    this.props.setIncomingAttack(attackObj)
  }

  onOutgoingAttack = doc => {
    const attackObj = this.onAttack(doc)
    console.log("Outgoing attack: ", attackObj)
    this.props.setOutgoingAttack(attackObj)
  }

  componentWillUnmount() {
    this.incomingAttackListener && this.incomingAttackListener()
    this.outgoingAttackListener && this.outgoingAttackListener()
    this.usersListener && this.usersListener()
  }

  onNicknameChange = nickname => {
    this.setState({ nickname })
    this.nicknameUpdateTimeout && clearInterval(this.nicknameUpdateTimeout)
    this.nicknameUpdateTimeout = setTimeout(() => this.updateUserData({ nickname }), NICKNAME_UPDATE_DELAY)
  }

  updateUserData = state => fs().doc("users/" + auth().currentUser.uid).set(state, { merge: true })
    .then(() => console.log("User data updated"))
    .catch(err => console.log("Failed to update user data"))

  attack = (uid: string): void => {
    console.log("Attacking user: ", uid)

    attack({ defender: uid })
      .then(res => console.log("AttackId: ", res.data.attackId))
      .catch(err => {
        console.log("Error attacking " + uid + ": ", err)
        Alert.alert("Something went wrong", err.message)
      })
  }

  getRequiredCash = (level = 1) => {
    const nextLevel = level + 1
    let xp = 0

    for (let i = 1; i < nextLevel; i++) {
      xp += Math.floor(i + 300 * Math.pow(2, i / 7))
    }

    return Math.floor(xp / 4)
  }

  levelUp = () => {
    console.log("Leveling up")
    const requiredCash = this.getRequiredCash(this.props.user)
    if (this.props.user.cash < requiredCash) return Alert.alert("Not enough cash")

    this.updateUserData({
      cash: Math.floor(this.props.user.cash - requiredCash),
      level: this.props.user.level + 1,
    })
  }

  render() {
    return (
      <View style={styles.container}>
      <StatusBar barStyle="light-content" />
        <View style={styles.innerContainer}>
          <TextInput
            style={styles.nicknameInput}
            value={this.state.nickname}
            placeholder="Set a nickname"
            onChangeText={this.onNicknameChange}
            allowFontScaling={false}
            placeholderTextColor="silver"
          />
          <Text style={styles.cashText}>{"Cash: " + (this.props.user.cash || 0)}</Text>
          <TouchableHighlight
            underlayColor="transparent"
            onPress={this.levelUp}
          >
            <View style={styles.levelUpButton}>
              <Text style={styles.levelText}>{"Level " + (this.props.user.level || 1)}</Text>
              <Text style={styles.levelUpText}>{"Level up for " + this.getRequiredCash(this.props.user.level) + " cash"}</Text>
            </View>
          </TouchableHighlight>
        </View>
        <List
          data={Object.keys(this.props.users).filter(uid => uid !== auth().currentUser.uid)}
          onPress={this.attack}
        />
      </View>
    )
  }
}

const mapStateToProps = (state, props) => ({
  user: state.users[auth().currentUser.uid] || {},
  users: state.users,
})
const mapDispatchToProps = dispatch => ({
  setUser: (uid, user) => dispatch({ uid, payload: user, type: setUser }),
  setIncomingAttack: attack => dispatch({ type: setIncomingAttack, uid: attack.attacker, payload: attack }),
  setOutgoingAttack: attack => dispatch({ type: setOutgoingAttack, uid: attack.defender, payload: attack }),
})
export default connect(mapStateToProps, mapDispatchToProps)(MainComponent)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    alignItems: "center",
    justifyContent: "center",
    // paddingTop: Platform.OS === "ios" ? 64 : 10,
  },

  innerContainer: {
    height: 200,
    width: Dimensions.get("window").width,
    paddingTop: Platform.OS === "ios" ? 40 : 10,
    backgroundColor: "#9b59b6",
    alignItems: "center",
  },

  nicknameInput: {
    color: "white",
    fontSize: 22,
  },

  cashText: {
    fontSize: 25,
    color: "white",
    padding: 20,
  },

  levelText: {
    fontSize: 20,
    color: "white",
  },

  levelUpButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  levelUpText: {
    color: "white",
  },
})
