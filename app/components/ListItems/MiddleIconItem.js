import React from "react"
import { StyleSheet, View, TouchableHighlight } from "react-native"

import ItemIcon from "./ItemIcon"

const getBackgroundColor = props => {
  if (props.destructive) return "#EF9A9A"
  if (props.important) return "#81D4FA"
  return "white"
}

export default props => (
  <TouchableHighlight
    style={[styles.itemContainer, { backgroundColor: getBackgroundColor(props) }, props.containerStyle]}
    underlayColor="transparent"
    onPress={props.onPress && props.onPress}
  >
    <View style={styles.contentContainer}>
      <ItemIcon
        name={props.icon}
        fullName={props.fullIconName}
        color={props.iconColor || props.color || "#4B4B4B"}
      />
    </View>
  </TouchableHighlight>
)

const styles = StyleSheet.create({ // eslint-disable-line
  itemContainer: {
    paddingHorizontal: 10,
    backgroundColor: "white",
    justifyContent: "center",
    height: 80,
  },

  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerText: {
    color: "#4B4B4B",
  },

  textContainer: {
    paddingHorizontal: 10,
    justifyContent: "center",
  },
})
