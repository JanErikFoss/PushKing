import * as React from "react"
import { StyleSheet, Text, View, Alert, Dimensions, Platform, TextInput, StatusBar, TouchableHighlight } from "react-native"

import { connect } from "react-redux"
import { setIncomingAttack, setOutgoingAttack } from "../actions"

import * as T from "../types"

import MoreCashText from "./MoreCashText"
import Lists from "./Lists"

import { auth, fs, functions } from "../modules/Firebase"

export interface Props {
  user: T.User,
  attacks: { [uid: string]: T.Attack },
  setIncomingAttack: (uid: string, attack: T.Attack) => void,
  setOutgoingAttack: (uid: string, attack: T.Attack) => void,
}

interface State {
  nickname: string,
}

const NICKNAME_UPDATE_DELAY = 1 * 1000

class MainComponent extends React.Component<Props, State> {
  state = { nickname: "" }
  incomingAttackListener = null
  outgoingAttackListener = null
  usersListener = null
  nicknameUpdateTimeout = null

  componentDidMount() {
    this.setIncomingAttackListener(null)
    this.setOutgoingAttackListener(null)

    // this.attackMyself()
  }

  attackMyself = () => fs().collection("attacks").add({
    attacker: "FM8tExcdht8KP0sVM8SV",
    defender: auth().currentUser.uid,
    finishTime: new Date(Date.now() + 120 * 1000),
    timestamp: new Date(),
    state: "started",
  })

  setIncomingAttackListener = err => {
    if (err) console.log("Error in attack listener: ", err)
    this.incomingAttackListener && this.incomingAttackListener()
    this.incomingAttackListener = fs().collection("attacks")
      .where("defender", "==", auth().currentUser.uid)
      .where("state", "==", "started")
      .onSnapshot(this.onIncomingAttacks, this.setIncomingAttackListener)
  }
  onIncomingAttacks = qss => qss.docChanges.forEach(change => {
    const doc = change.doc
    if (change.type === "removed") {
      return doc.data() && this.props.setIncomingAttack(doc.data().attacker, null)
    }
    if (change.type === "modified") return this.onIncomingAttack(doc)
    if (change.type === "added") return this.onIncomingAttack(doc)
  })

  setOutgoingAttackListener = err => {
    if (err) console.log("Error in attack listener: ", err)
    this.outgoingAttackListener && this.outgoingAttackListener()
    this.outgoingAttackListener = fs().collection("attacks")
      .where("attacker", "==", auth().currentUser.uid)
      .where("state", "==", "started")
      .onSnapshot(this.onOutgoingAttacks, this.setOutgoingAttackListener)
  }
  onOutgoingAttacks = qss => qss.docChanges.forEach(change => {
    const doc = change.doc
    if (change.type === "removed") {
      return doc.data() && this.props.setOutgoingAttack(doc.data().defender, null)
    }
    if (change.type === "modified") return this.onOutgoingAttack(doc)
    if (change.type === "added") return this.onOutgoingAttack(doc)
  })

  getAttackObj = doc => {
    const data = doc.exists && doc.data()
    if (!data) return console.log("Attack doc has been deleted")
    if (!data.defender || !data.attacker) return console.log("Missing attack data")
    return { ...data, attackId: doc.id }
  }

  onIncomingAttack = doc => {
    const attackObj = this.getAttackObj(doc)
    console.log("Incoming attack: ", attackObj)
    if (!attackObj) return
    this.props.setIncomingAttack(attackObj.attacker, attackObj)
  }

  onOutgoingAttack = doc => {
    const attackObj = this.getAttackObj(doc)
    console.log("Outgoing attack: ", attackObj)
    if (!attackObj) return
    this.props.setOutgoingAttack(attackObj.defender, attackObj)
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
    .catch(err => console.log("Failed to update user data: ", err))

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
    const level = this.props.user.level || 1
    const cash = this.props.user.cash || 0

    const requiredCash = this.getRequiredCash(level)
    if (cash < requiredCash) return Alert.alert("Not enough cash")

    this.updateUserData({
      cash: Math.floor(cash - requiredCash),
      level: level + 1,
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.innerContainer}>
          <TextInput
            style={styles.nicknameInput}
            value={this.props.user && this.props.user.nickname}
            placeholder="Set a nickname"
            onChangeText={this.onNicknameChange}
            allowFontScaling={false}
            placeholderTextColor="silver"
          />
          <Text style={styles.cashText}>{"Cash: " + (this.props.user.cash || 0)}</Text>
          <MoreCashText level={(this.props.user.level || 1)} />
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
        <Lists />
      </View>
    )
  }
}

const mapStateToProps = (state, props) => ({
  user: state.users[auth().currentUser.uid] || {},
  attacks: state.attacks,
})
const mapDispatchToProps = dispatch => ({
  setIncomingAttack: (uid, attack) => dispatch({ uid, type: setIncomingAttack, payload: attack }),
  setOutgoingAttack: (uid, attack) => dispatch({ uid, type: setOutgoingAttack, payload: attack }),
})
export default connect(mapStateToProps, mapDispatchToProps)(MainComponent)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    // alignItems: "center",
    // justifyContent: "center",
  },

  innerContainer: {
    height: 210,
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
    paddingTop: 20,
  },

  levelText: {
    fontSize: 20,
    color: "white",
    paddingTop: 20,
  },

  levelUpButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  levelUpText: {
    color: "white",
  },
})
