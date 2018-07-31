import * as React from "react"
import { StyleSheet, View, TextInput } from "react-native"

import { default as ActionSheet } from "react-native-actionsheet"

import { connect } from "react-redux"
import { setUser } from "../actions"

import * as T from "../types"

import ListPure from "./ListPure"

import { auth, fs } from "../modules/Firebase"
import { actionOnUser, attackUser, toggleFriend, monitorUser, reportUser } from "../modules/Actions"

const DELAY = 1 * 500

export interface Props {
  user: T.User,
  users: T.User[],
  friends: string[],
  setUser: (uid: string, user: Object) => void,
}

interface State {
  nickname: string,
  uids: string[],
}

class FriendsList extends React.Component<Props, State> {
  state = { nickname: "", uids: [] }
  listener = null
  userListeners = {}
  unmounted = false
  actionSheet = null
  asUid = null
  timeout = null

  componentWillUnmount() {
    this.unmounted = true
  }
  componentDidUpdate() {
    this.props.friends.forEach(uid => monitorUser(uid, "FriendsList.tsx"))
  }

  startListener = () => {
    console.log("Starting listener")
    this.listener && this.listener()
    this.listener = fs().collection("users")
      .where("nickname", ">=", this.state.nickname)
      .limit(10)
      .onSnapshot(this.onQss, err => console.log("Listener error: ", err))
  }
  onQss = qss => {
    const docs = qss.docs
      .filter(doc => doc.exists && doc.id !== auth().currentUser.uid)

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
    Attack: () => attackUser(this.asUid),
    "Add friend": () => toggleFriend(this.asUid, true),
    "Remove friend": () => toggleFriend(this.asUid, false),
    "Report offensive name": () => reportUser(this.asUid, "offensive name"),
  }

  onTextChange = nickname => {
    this.setState({ nickname })
    this.timeout && clearInterval(this.timeout)
    if (nickname) this.timeout = setTimeout(this.startListener, DELAY)
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
        <TextInput
          style={styles.input}
          placeholder="Add friends"
          onChangeText={this.onTextChange}
          allowFontScaling={false}
          placeholderTextColor="silver"
        />
        <ListPure
          isFriendsList={!!this.state.nickname}
          data={this.state.nickname ? this.state.uids : this.props.friends}
          onPress={this.state.nickname ? toggleFriend : actionOnUser}
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
  },

  input: {
    backgroundColor: "white",
    height: 60,
    padding: 15,
    fontSize: 18,
    marginBottom: 1,
  },
})
