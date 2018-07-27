
import * as React from "react"

import { connect } from "react-redux"

import ListItem from "./ListItem"

import * as T from "../types"

interface Props {
  uid: string,
  user: T.User,
  incomingAttack?: T.Attack,
  outgoingAttack?: T.Attack,
  onPress: (uid: string) => void,
}

interface State {

}

export class UserItemComponent extends React.Component<Props, State> {

  componentDidMount() {
    console.log("Props: ", this.props)
  }

  onPress = () => this.props.onPress(this.props.uid)

  render() {
    return <ListItem
      icon="person"
      headers={[
        this.props.user.nickname || this.props.user.uid,
        "Cash: " + (this.props.user.cash || 0),
        "Level: " + (this.props.user.level || 1),
      ]}
      attackFinish={this.props.incomingAttack && this.props.incomingAttack.finishTime}
      defendFinish={this.props.outgoingAttack && this.props.outgoingAttack.finishTime}
      onPress={this.onPress}
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
export default connect(mapStateToProps, mapDispatchToProps)(UserItemComponent)
