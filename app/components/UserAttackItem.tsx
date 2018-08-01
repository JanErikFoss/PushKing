
import * as React from "react"

import { connect } from "react-redux"

import UserAttackItemPure from "./UserAttackItemPure"

import * as T from "../types"

interface Props {
  uid: string,
  user: T.User,
  incomingAttack?: T.Attack,
  outgoingAttack?: T.Attack,
  onPress?: (uid: string) => Promise<void>,
  onLongPress?: (uid: string) => void,
}

interface State {
  showSpinner: boolean,
}

export class UserAttackItemComponent extends React.Component<Props, State> {
  state = { showSpinner: false }

  onPress = async () => {
    if (!this.props.onPress) return
    if (this.state.showSpinner) return
    try {
      this.setState({ showSpinner: true })
      await this.props.onPress(this.props.uid)
    } finally {
      this.setState({ showSpinner: false })
    }
  }
  onLongPress = () => this.props.onLongPress && this.props.onLongPress(this.props.uid)

  render() {
    if (!this.props.user) {
      console.log("Skipping render of null user object")
      return null
    }

    const attackFinish = this.props.outgoingAttack && this.props.outgoingAttack.finishTime
    const defendFinish = this.props.incomingAttack && this.props.incomingAttack.finishTime

    return <UserAttackItemPure
      icon="person"
      headers={[
        this.props.user.nickname || this.props.user.uid || "Mysterious user",
        "Cash: " + this.props.user.cash.toLocaleString(),
        "Level: " + this.props.user.level.toLocaleString(),
      ]}
      showSwordSpinner={this.state.showSpinner}
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
const mapDispatchToProps = null
export default connect(mapStateToProps, mapDispatchToProps)(UserAttackItemComponent)
