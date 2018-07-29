import * as React from "react"
import { StyleSheet, View } from "react-native"

import { default as ActionSheet } from "react-native-actionsheet"

import { connect } from "react-redux"
import { setUser, setIncomingAttack, setOutgoingAttack } from "../actions"

import * as T from "../types"

import ListPure from "./ListPure"

import { auth, fs } from "../modules/Firebase"
import { actionOnUser, attackUser, monitorUser } from "../modules/Actions"

export interface Props {
  user: T.User,
  users: T.User[],
  setUser: (uid: string, user: Object) => void,
  setIncomingAttack: (uid: string, attack: T.Attack) => void,
  setOutgoingAttack: (uid: string, attack: T.Attack) => void,
}

interface State {
  incoming: string[],
  outgoing: string[],
}

class TopList extends React.Component<Props, State> {
  state = { incoming: [], outgoing: [] }
  inListener = null
  outListener = null
  unmounted = false
  actionSheet = null
  asUid = null
  userListeners = {}

  componentDidMount() {
    this.setListeners()
  }

  restartListeners = err => {
    console.log("Restarting listeners with error: ", err)
    setTimeout(() => this.setListeners(), 1000)
  }

  setListeners = () => {
    this.inListener && this.inListener()
    this.outListener && this.outListener()

    this.inListener = fs().collection("attacks")
      .where("defender", "==", auth().currentUser.uid)
      .where("state", "==", "started")
      .limit(10)
      .onSnapshot(this.onIncoming, this.restartListeners)

    this.outListener = fs().collection("attacks")
      .where("attacker", "==", auth().currentUser.uid)
      .where("state", "==", "started")
      .limit(10)
      .onSnapshot(this.onOutgoing, this.restartListeners)
  }

  onIncoming = qss => {
    console.log("Incoming attacks: ", qss.docs)
    const docs = qss.docs.filter(doc => doc.exists)
    docs.forEach(doc => {
      this.props.setIncomingAttack(doc.id, doc.data())
      monitorUser(doc.data().attacker)
    })
    this.setState({ incoming: docs.map(doc => doc.data().attacker) })
  }
  onOutgoing = qss => {
    console.log("Outgoing attacks: ", qss.docs)
    const docs = qss.docs.filter(doc => doc.exists)
    docs.forEach(doc => {
      this.props.setOutgoingAttack(doc.id, doc.data())
      monitorUser(doc.data().defender)
    })
    this.setState({ outgoing: docs.map(doc => doc.data().defender) })
  }

  onPress = (uid: string) => {
    if (uid === auth().currentUser.uid) return
    actionOnUser(uid)
  }
  onLongPress = (uid: string) => {
    if (uid === auth().currentUser.uid) return
    this.asUid = uid
    this.actionSheet && this.actionSheet.show()
  }

  openActionSheet = () => this.actionSheet && this.actionSheet.show()
  onActionSheetPressed = i => Object.values(this.actionSheetConfig)[i]()
  actionSheetConfig = {
    Cancel: () => {},
    Attack: () => attackUser(this.asUid)
  }

  render() {
    console.log("Rendering attacks with data: ", [...this.state.incoming, ...this.state.outgoing])
    return (
      <View style={styles.container}>
        <ActionSheet
          ref={o => { this.actionSheet = o }}
          options={Object.keys(this.actionSheetConfig)}
          cancelButtonIndex={0}
          onPress={this.onActionSheetPressed}
        />
        <ListPure
          data={[...this.state.incoming, ...this.state.outgoing]}
          onPress={this.onPress}
          onLongPress={this.onLongPress}
        />
      </View>
    )
  }
}

const mapStateToProps = (state, props) => ({
  user: state.users[auth().currentUser.uid] || {},
  users: state.users,
  attacks: state.attacks,
})
const mapDispatchToProps = dispatch => ({
  setUser: (uid, user) => dispatch({ uid, payload: user, type: setUser }),
  setIncomingAttack: (uid, attack) => dispatch({ uid, type: setIncomingAttack, payload: attack }),
  setOutgoingAttack: (uid, attack) => dispatch({ uid, type: setOutgoingAttack, payload: attack }),
})
export default connect(mapStateToProps, mapDispatchToProps)(TopList)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dedede",
  }
})
