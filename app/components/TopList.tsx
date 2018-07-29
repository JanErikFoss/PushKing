import * as React from "react"
import { StyleSheet, View } from "react-native"

import { default as ActionSheet } from "react-native-actionsheet"

import { connect } from "react-redux"
import { setUser } from "../actions"

import * as T from "../types"

import ListPure from "./ListPure"

import { auth, fs } from "../modules/Firebase"
import { actionOnUser } from "../modules/Actions"

export interface Props {
  user: T.User,
  users: T.User[],
  setUser: (uid: string, user: Object) => void,
}

interface State {
  uids: string[],
}

class TopList extends React.Component<Props, State> {
  state = { uids: [] }
  listener = null
  unmounted = false
  actionSheet = null
  asUid = null

  componentDidMount() {
    this.setListener()
  }

  restartListener = err => {
    console.log("Restarting listener with error: ", err)
    setTimeout(() => this.setListener(), 1000)
  }

  setListener = () => {
    this.listener && this.listener()
    this.listener = fs().collection("users")
      .orderBy("cash", "desc")
      .limit(10)
      .onSnapshot(this.onUsers, this.restartListener)
  }

  onUsers = qss => {
    const docs = qss.docs
      .filter(doc => doc.exists)
      .filter(doc => doc.id !== auth().currentUser.uid)

    docs.forEach(doc => this.props.setUser(doc.id, doc.data()))

    const uids = docs.map(doc => doc.id)
    this.setState({ uids })
  }

  onLongPress = (uid: string) => {
    this.asUid = uid
    this.actionSheet && this.actionSheet.show()
  }

  openActionSheet = () => this.actionSheet && this.actionSheet.show()
  onActionSheetPressed = i => Object.values(this.actionSheetConfig)[i]()
  actionSheetConfig = {
    Cancel: () => {},
    Apple: () => console.log("He likes apples"),
    Orange: () => console.log("He likes oranges"),
    "With space": () => console.log("He likes spaces"),
  }

  render() {
    return (
      <View style={styles.container}>
        <ActionSheet
          ref={o => { this.actionSheet = o }}
          options={Object.keys(this.actionSheetConfig)}
          cancelButtonIndex={0}
          onPress={this.onActionSheetPressed}
        />
        <ListPure
          data={this.state.uids}
          onPress={actionOnUser}
          onLongPress={this.openActionSheet}
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
