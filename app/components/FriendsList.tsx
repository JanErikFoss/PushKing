import * as React from "react"
import { StyleSheet, View } from "react-native"

import { default as ActionSheet } from "react-native-actionsheet"

import { connect } from "react-redux"
import { setUser } from "../actions"

import * as T from "../types"

import ListPure from "./ListPure"

import { auth, fs } from "../modules/Firebase"
import { actionOnUser, attackUser, toggleFriend } from "../modules/Actions"

export interface Props {
  user: T.User,
  users: T.User[],
  friends: string[],
  setUser: (uid: string, user: Object) => void,
}

interface State {
}

class FriendsList extends React.Component<Props, State> {
  listener = null
  userListeners = {}
  unmounted = false
  actionSheet = null
  asUid = null

  componentDidMount() {
    this.startListener()
  }
  componentWillUnmount() {
    this.unmounted = true
    this.listener && this.listener()
    Object.values(this.userListeners).forEach(listener => listener && listener())
  }

  startListener = () => {
    if (this.unmounted) return
    console.log("Starting listener")
    this.listener = fs().doc("users/" + auth().currentUser.uid).onSnapshot(this.onChange, this.onError)
  }
  onError = err => {
    console.log("Listener error: ", err)
    setTimeout(this.startListener, 1000)
  }
  onChange = doc => {
    const data = doc.exists && doc.data()
    if (!data) return console.log("User data does not exist")
    console.log("User data changed: ", data)
    this.props.setUser(doc.id, data)

    const friends = data.friends || {}
    Object.keys(friends || {})
      .filter(uid => friends[uid])
      .filter(uid => !this.userListeners[uid])
      .forEach(this.setFriendDataListener)
  }

  setFriendDataListener = uid => {
    if (this.unmounted) return
    console.log("Setting friend data listener for uid " + uid)
    this.userListeners[uid] = fs().doc("users/" + uid).onSnapshot(this.onFriendData, err => this.onFriendError(err, uid))
  }
  onFriendError = (err, uid) => {
    console.log("Friend data listener error: ", err)
    setTimeout(() => this.setFriendDataListener(uid), 1000)
  }
  onFriendData = doc => {
    const data = doc.exists && doc.data()
    console.log("Friend " + doc.id + ": ", data)
    this.props.setUser(doc.id, data)
  }

  onLongPress = (uid: string) => {
    this.asUid = uid
    this.actionSheet && this.actionSheet.show()
  }

  openActionSheet = () => this.actionSheet && this.actionSheet.show()
  onActionSheetPressed = i => Object.values(this.actionSheetConfig)[i]()
  actionSheetConfig = {
    Cancel: () => {},
    "Remove friend": () => toggleFriend(this.asUid),
    Attack: () => attackUser(this.asUid)
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
          data={this.props.friends}
          onPress={actionOnUser}
          onLongPress={this.onLongPress}
        />
      </View>
    )
  }
}

const mapStateToProps = (state, props) => {
  const user = state.users[auth().currentUser.uid] || {}
  const friends = Object.keys(user.friends || {}).filter(uid => user && user.friends && user.friends[uid])

  return {
    user,
    friends,
    users: state.users,
  }
}
const mapDispatchToProps = dispatch => ({
  setUser: (uid, user) => dispatch({ uid, payload: user, type: setUser }),
})
export default connect(mapStateToProps, mapDispatchToProps)(FriendsList)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dedede",
  }
})
