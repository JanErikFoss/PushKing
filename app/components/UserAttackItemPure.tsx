import * as React from "react"
import { StyleSheet, View, TouchableHighlight, Text, Dimensions, Image } from "react-native"

import ItemIcon from "./ListItems/ItemIcon"

const SHIELD = require("../images/shield.png")
const SWORD = require("../images/sword.png")

interface Props {
  icon: string,
  headers: string[],
  color?: string,

  attackFinish?: Date,
  defendFinish?: Date,

  onPress?: Function,
  onLongPress?: Function,
}

interface State {

}

export default class ListItem extends React.Component<Props, State> {
  interval = null

  componentDidMount() {
    this.interval = setInterval(() => this.forceUpdate(), 1000)
  }
  componentWillUnmount() {
    clearTimeout(this.interval)
  }

  onPress = (x:any): boolean => {
    this.props.onPress && this.props.onPress()
    return false
  }

  onLongPress = (x:any): boolean => {
    this.props.onLongPress && this.props.onLongPress()
    return false
  }

  getRemainingString = date => {
    if (!date) return null
    const remaining = (date.getTime() - Date.now()) / 1000
    if (remaining < 1) return null

    const i = Math.floor(remaining)

    if (i < 1) return "0s"
    if (i < 60) {
      if (i === 1) return "1s"
      return i + "s"
    }
    if (i < 3600) {
      const minutes = Math.round(i / 60) || 0
      if (minutes === 1) return "1m"
      return minutes + "m"
    }
    const hours = Math.round(i / 3600)
    if (hours === 1) return "1h"
    return hours + "h"
  }

  render() {
    const swordRemainingString = this.getRemainingString(this.props.attackFinish)
    const shieldRemainingString = this.getRemainingString(this.props.defendFinish)

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

          <View style={styles.imageContainer}>
            {swordRemainingString && (
              <React.Fragment>
                <Image source={SHIELD} style={styles.image} />
                <Text>{swordRemainingString}</Text>
              </React.Fragment>
            )}
          </View>

          <View style={styles.imageContainer}>
            {shieldRemainingString && (
              <React.Fragment>
                <Image source={SWORD} style={styles.image} />
                <Text>{shieldRemainingString}</Text>
              </React.Fragment>
            )}
          </View>

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
