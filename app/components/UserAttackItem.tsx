
import * as React from "react"

import { connect } from "react-redux"

import UserAttackItemPure from "./UserAttackItemPure"

import * as T from "../types"

interface Props {
  uid: string,
  user: T.User,
  incomingAttack?: T.Attack,
  outgoingAttack?: T.Attack,
  onPress?: (uid: string) => void,
  onLongPress?: (uid: string) => void,
}

interface State {

}

export class UserAttackItemComponent extends React.Component<Props, State> {
  onPress = () => this.props.onPress && this.props.onPress(this.props.uid)
  onLongPress = () => this.props.onLongPress && this.props.onLongPress(this.props.uid)

  render() {
    if (!this.props.user) {
      console.log("Skipping render of null user object")
      return null
    }

    const attackFinish = this.props.incomingAttack && this.props.incomingAttack.finishTime
    const defendFinish = this.props.outgoingAttack && this.props.outgoingAttack.finishTime

    return <UserAttackItemPure
      icon="person"
      headers={[
        this.props.user.nickname || this.props.user.uid || "Mysterious user",
        "Cash: " + (this.props.user.cash || 0),
        "Level: " + (this.props.user.level || 1),
      ]}
      attackFinish={attackFinish}
      defendFinish={defendFinish}
      onPress={this.onPress}
      onLongPress={this.onLongPress}
    />
  }
}

const mapStateToProps = (state, props) => ({
  user: state.users[props.uid],
  incomingAttack: state.attacks.incoming[props.uid],
  outgoingAttack: state.attacks.outgoing[props.uid],
})
const mapDispatchToProps = dispatch => ({
})
export default connect(mapStateToProps, mapDispatchToProps)(UserAttackItemComponent)
