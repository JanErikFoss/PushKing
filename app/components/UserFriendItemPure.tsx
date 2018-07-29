import * as React from "react"
import { StyleSheet, View, TouchableHighlight, Text, Dimensions, Image } from "react-native"

import ItemIcon from "./ListItems/ItemIcon"

interface Props {
  icon: string,
  headers: string[],
  color?: string,

  isFriends: boolean,

  onPress?: Function,
  onLongPress?: Function,
}

interface State {

}

export default class UserFriendItemPure extends React.Component<Props, State> {
  onPress = (x:any): boolean => {
    this.props.onPress && this.props.onPress()
    return false
  }

  onLongPress = (x:any): boolean => {
    this.props.onLongPress && this.props.onLongPress()
    return false
  }

  render() {
    return (
      <TouchableHighlight
        underlayColor="transparent"
        onPress={this.onPress}
        onLongPress={this.onLongPress}
      >
        <View style={styles.contentContainer}>
          <ItemIcon
            name={this.props.icon}
            color={"#4B4B4B"}
          />
          <View style={styles.textContainer}>

            {this.props.headers && this.props.headers.map((string, index) => (
              <Text
                allowFontScaling={false}
                style={[index ? styles.smallHeaderText : styles.headerText, { color: this.props.color || "#4B4B4B" }]}
                key={index.toString()}
              >
                {string}
              </Text>
            ))}

          </View>

          <View style={styles.childrenContainer}>
            {this.props.children}
          </View>

          <ItemIcon name={this.props.isFriends ? "remove" : "add"} />

        </View>
      </TouchableHighlight>
    )
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: "white",
    width: Dimensions.get("window").width,
    height: 100,
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
  },

  textContainer: {
    paddingHorizontal: 8,
    justifyContent: "center",
    flex: 1,
  },

  headerText: {
    color: "#4B4B4B",
    flexWrap: "wrap",
    flexDirection: "column",
  },
  smallHeaderText: {
    paddingTop: 10,
    fontSize: 12,
    flexWrap: "wrap",
    flexDirection: "column",
  },

  imageContainer: {
    width: 42,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  image: {
    height: 22,
    width: 22,
    opacity: 0.7,
  },

  childrenContainer: {
    justifyContent: "center",
  },
})
