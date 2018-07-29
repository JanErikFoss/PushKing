import * as React from "react"
import { StyleSheet, View } from "react-native"

import { default as ActionSheet } from "react-native-actionsheet"

import { connect } from "react-redux"
import { setUser } from "../actions"

import * as T from "../types"

import ListPure from "./ListPure"

import { auth, fs } from "../modules/Firebase"
import { actionOnUser, attackUser, toggleFriend, reportUser } from "../modules/Actions"

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
      .limit(20)
      .onSnapshot(this.onUsers, this.restartListener)
  }

  onUsers = qss => {
    const docs = qss.docs
      .filter(doc => doc.exists)
      // .filter(doc => doc.id !== auth().currentUser.uid)

    docs.forEach(doc => this.props.setUser(doc.id, doc.data()))

    const uids = docs.map(doc => doc.id)
    this.setState({ uids })
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
    Attack: () => attackUser(this.asUid),
    "Add friend": () => toggleFriend(this.asUid, true),
    "Remove friend": () => toggleFriend(this.asUid, false),
    "Report offensive name": () => reportUser(this.asUid, "offensive name"),
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
})
export default connect(mapStateToProps, mapDispatchToProps)(TopList)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dedede",
  }
})
