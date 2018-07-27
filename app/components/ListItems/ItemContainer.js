import React from "react"
import { StyleSheet, View, Text, TouchableHighlight, Dimensions } from "react-native"

import AnimatedBackground from "./AnimatedBackground"
import ItemIcon from "./ItemIcon"

const contentContainerFlexStyle = {
  width: undefined,
  flex: 1,
}

const getContentContainerStyle = props => [
  styles.contentContainer,
  props.useFlex && contentContainerFlexStyle,
  props.containerStyle,
].filter(Boolean)

export default props => (
  <AnimatedBackground animate={props.isLoading}>
    <TouchableHighlight
      underlayColor="transparent"
      onPress={props.onPress}
      onLongPress={props.onLongPress}
    >
      <View style={getContentContainerStyle(props)}>
        {!props.hideLeftIcon && <ItemIcon
          name={props.icon}
          fullName={props.fullIconName}
          noOutline={props.noIconOutline}
          color={props.iconColor || props.color || "#4B4B4B"}
        />}
        <View style={styles.textContainer}>
          <Text
            allowFontScaling={false}
            style={[styles.headerText, { color: props.color || "#4B4B4B" }]}
          >
            {props.header}
          </Text>
          {props.secondaryHeader &&
          <Text
            allowFontScaling={false}
            style={[styles.smallHeaderText, { color: props.color || "#4B4B4B" }]}
          >
            {props.secondaryHeader}
          </Text>
          }
          {props.tertiaryHeader &&
          <Text
            allowFontScaling={false}
            style={[styles.smallHeaderText, { color: props.color || "#4B4B4B" }]}
          >
            {props.tertiaryHeader}
          </Text>
          }
        </View>

        <View style={styles.childrenContainer}>
          {props.children}
        </View>

        {(props.iconRight || props.showRightIcon) && <ItemIcon
          name={props.iconRight}
          fullName={props.fullIconRight}
          color={props.iconColor || props.color || "#4B4B4B"}
        />}
      </View>
    </TouchableHighlight>
  </AnimatedBackground>
)

const styles = StyleSheet.create({
  contentContainer: {
    width: Dimensions.get("window").width,
    height: 80,
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
  },

  headerText: {
    color: "#4B4B4B",
    flexWrap: "wrap",
    flexDirection: "column",
  },
  smallHeaderText: {
    paddingTop: 5,
    fontSize: 12,
    flexWrap: "wrap",
    flexDirection: "column",
  },

  textContainer: {
    paddingHorizontal: 8,
    justifyContent: "center",
    flex: 1,
  },

  childrenContainer: {
    justifyContent: "center",
  },
})
