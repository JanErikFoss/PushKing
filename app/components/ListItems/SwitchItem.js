import React, { Component } from "react"
import { Switch, Platform } from "react-native"

import ItemContainer from "./ItemContainer"

export default class SwitchItem extends Component {
  constructor(props) {
    super(props)
    this.state = { value: this.props.initialValue || this.props.value }
  }

  onChange = value => this.props.onNewValue(value)

  render = () => (
    <ItemContainer {...this.props} >
      <Switch
        style={this.props.switchStyle}
        onValueChange={this.onChange}
        value={this.props.value}
        disabled={this.props.disabled}
        onTintColor="#00AEEF"
        thumbTintColor={Platform.OS === "ios" ? undefined : "white"}
      />
    </ItemContainer>
  )
}
