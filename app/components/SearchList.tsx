import * as React from "react"
import { StyleSheet, View, TextInput } from "react-native"

import { default as ActionSheet } from "react-native-actionsheet"

import { connect } from "react-redux"
import { setUser } from "../actions"

import * as T from "../types"

import ListPure from "./ListPure"

import { auth, fs } from "../modules/Firebase"
import { toggleFriend } from "../modules/Actions"

const DELAY = 1 * 500

export interface Props {
  user: T.User,
  users: T.User[],
  setUser: (uid: string, user: Object) => void,
}

interface State {
  nickname: string,
  uids: string[],
}

class SearchList extends React.Component<Props, State> {
  state = { nickname: "", uids: [] }
  listener = null
  timeout = null
  actionSheet = null
  asUid = null

  componentDidMount() {
    this.startListener()
  }

  startListener = () => {
    console.log("Starting listener")
    this.listener && this.listener()
    this.listener = fs().collection("users")
      .where("nickname", ">=", this.state.nickname)
      .limit(6)
      .onSnapshot(this.onQss, err => console.log("Listener error: ", err))
  }
  onQss = qss => {
    const docs = qss.docs
      .filter(doc => doc.exists && doc.id !== auth().currentUser.uid)

    docs.forEach(doc => this.props.setUser(doc.id, doc.data()))
    const uids = docs.map(doc => doc.id)
    this.setState({ uids })
  }

  onTextChange = nickname => {
    this.setState({ nickname })
    this.timeout && clearInterval(this.timeout)
    this.timeout = setTimeout(this.startListener, DELAY)
  }

  onLongPress = (uid: string) => {
    this.asUid = uid
    this.actionSheet && this.actionSheet.show()
  }

  onActionSheetPressed = i => Object.values(this.actionSheetConfig)[i]()
  actionSheetConfig = {
    Cancel: () => {},
    Apple: () => console.log("Apples: " + this.asUid),
    Orange: () => console.log("He likes oranges"),
    "With space": () => console.log("He likes spaces"),
  }

  render() {
    console.log("Rendering searchlist with uids: ", this.state.uids)
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
          placeholder="Search"
          onChangeText={this.onTextChange}
          allowFontScaling={false}
          placeholderTextColor="silver"
        />
        <ListPure
          isFriendsList
          data={this.state.uids}
          onPress={toggleFriend}
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
  setUser: (uid, user) => dispatch({ uid,  payload: user, type: setUser }),
})
export default connect(mapStateToProps, mapDispatchToProps)(SearchList)

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
  }
})
