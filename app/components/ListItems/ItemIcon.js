import React from "react"
import { StyleSheet, View, Platform } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

export default props => (
  <View style={[styles.container, props.style]}>
    <View style={styles.iconContainer}>
      {(props.fullName || props.name) && <Icon
        style={[styles.icon, { color: props.color }]}
        name={props.fullName || Platform.OS === "ios"
          ? ("ios-" + props.name + (props.noOutline ? "" : "-outline"))
          : props.fullName || ("md-" + props.name)
        }
      />}
    </View>
  </View>
)

const styles = StyleSheet.create({ // eslint-disable-line
  container: {
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    color: "#4b4b4b",
    fontSize: 36,
  },

  iconContainer: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
})
