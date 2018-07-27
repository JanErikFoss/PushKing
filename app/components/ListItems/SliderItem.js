import React, { Component } from "react"
import { StyleSheet, Slider, View, Text, Dimensions } from "react-native"

import ItemIcon from "./ItemIcon"

export default class UserOptions extends Component {
  constructor(props) {
    super(props)
    this.state = { value: this.props.value }
  }

  onChange = value => this.props.onNewValue(value)

  render = () => (
    <View style={styles.container}>
      <ItemIcon
        name={this.props.icon}
        fullName={this.props.fullIconName}
        color={this.props.iconColor || this.props.color || "#4B4B4B"}
      />
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text
            style={styles.text}
            allowFontScaling={false}
          >
            {this.props.text}
          </Text>
        </View>
        <Slider style={styles.slider}
          minimumValue={this.props.min || 0}
          maximumValue={this.props.max || 0}
          onValueChange={this.props.onValueChange}
          onSlidingComplete={this.props.onSlidingComplete}
          value={this.state.value}
          step={this.props.step || 1}
          minimumTrackTintColor={this.props.minimumTrackTintColor || "#46adf3"}
          maximumTrackTintColor={this.props.maximumTrackTintColor || "#46adf3"}
          thumbTintColor={this.props.thumbTintColor || "silver"}
          disabled={this.props.disabled}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({ // eslint-disable-line
  container: {
    width: Dimensions.get("window").width,
    height: 80,
    padding: 8,
    backgroundColor: "white",
    flexDirection: "row",
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },

  textContainer: {
    // backgroundColor: "mistyrose",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },

  text: {
    color: "#4b4b4b",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    flexDirection: "column",
  },

  slider: {
    flex: 1,
  },
})
