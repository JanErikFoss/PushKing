
import * as React from "react"

import { connect } from "react-redux"

import UserFriendItemPure from "./UserFriendItemPure"

import { auth } from "../modules/Firebase"

import * as T from "../types"

interface Props {
  uid: string,
  user: T.User,
  isFriends: boolean,
  onPress?: (uid: string) => void,
  onLongPress?: (uid: string) => void,
}

interface State {

}

export class UserFriendItemComponent extends React.Component<Props, State> {
  componentDidMount() {
    console.log("Friend props: ", this.props)
  }

  onPress = () => this.props.onPress && this.props.onPress(this.props.uid)
  onLongPress = () => this.props.onLongPress && this.props.onLongPress(this.props.uid)

  render() {
    if (!this.props.user) {
      console.log("Skipping render of null user object")
      return null
    }

    console.log("Rendering non-pure item with props: ", this.props)

    return (
      <UserFriendItemPure
        icon="person"
        headers={[
          this.props.user.nickname || "Mysterious figure",
          "Cash: " + (this.props.user.cash || 0),
          "Level: " + (this.props.user.level || 1),
        ]}
        isFriends={this.props.isFriends}
        onPress={this.onPress}
        onLongPress={this.onLongPress}
      />
    )
  }
}

const mapStateToProps = (state, props) => {
  const localUser = state.users[auth().currentUser.uid] || {}
  const isFriends = localUser.friends && localUser.friends[props.uid]

  return {
    isFriends,
    user: state.users[props.uid],
  }
}
const mapDispatchToProps = dispatch => ({
})
export default connect(mapStateToProps, mapDispatchToProps)(UserFriendItemComponent)
