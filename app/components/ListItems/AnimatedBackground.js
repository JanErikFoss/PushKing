import React, { Component } from "react"
import { Animated, Easing } from "react-native"

export default class App extends Component {
  animatedValue = new Animated.Value(0)

  componentDidMount = () => this.callback()
  componentDidUpdate = prevProps => prevProps.animate !== this.props.animate && this.callback()

  callback = () => {
    if (!this.props.animate) {
      this.animatedValue.stopAnimation()
      this.animatedValue.setValue(0)
      return
    }

    // console.log("Animating")
    this.animatedValue.setValue(0)
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.inOut(Easing.circle),
    })
      .start(this.callback)
  }

  render() {
    const backgroundColor = this.animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ["#ffffff", "#46adf3ee", "#ffffff"],
    })

    return (
      <Animated.View style={[{ backgroundColor }, this.props.style]}>
        {this.props.children}
      </Animated.View>
    )
  }
}
