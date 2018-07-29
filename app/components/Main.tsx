import * as React from "react"
import { StyleSheet, Text, View, Alert, Dimensions, Platform, TextInput, StatusBar, TouchableHighlight } from "react-native"

import { connect } from "react-redux"

import MoreCashText from "./MoreCashText"
import Lists from "./Lists"

import { auth, fs } from "../modules/Firebase"

export interface Props {
  cash: number,
  level: number,
  nickname: string,
}

interface State {
}

const NICKNAME_UPDATE_DELAY = 1 * 1000

class MainComponent extends React.Component<Props, State> {
  nicknameUpdateTimeout = null

  onNicknameChange = nickname => {
    this.setState({ nickname })
    this.nicknameUpdateTimeout && clearInterval(this.nicknameUpdateTimeout)
    this.nicknameUpdateTimeout = setTimeout(() => this.updateUserData({ nickname }), NICKNAME_UPDATE_DELAY)
  }

  updateUserData = state => fs().doc("users/" + auth().currentUser.uid).set(state, { merge: true })
    .then(() => console.log("User data updated"))
    .catch(err => console.log("Failed to update user data: ", err))

  getRequiredCash = (level = 1) => {
    const nextLevel = level + 1
    let xp = 0
    for (let i = 1; i < nextLevel; i++) {
      xp += Math.floor(i + 300 * Math.pow(2, i / 7))
    }
    return Math.floor(xp / 4)
  }

  levelUp = () => {
    console.log("Leveling up")
    const level = this.props.level
    const cash = this.props.cash

    const requiredCash = this.getRequiredCash(level)
    if (cash < requiredCash) return Alert.alert("Not enough cash")

    this.updateUserData({
      cash: Math.floor(cash - requiredCash),
      level: level + 1,
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.innerContainer}>
          <TextInput
            style={styles.nicknameInput}
            value={this.props.nickname}
            placeholder="Set a nickname"
            onChangeText={this.onNicknameChange}
            allowFontScaling={false}
            placeholderTextColor="silver"
          />
          <Text style={styles.cashText}>{"Cash: " + (this.props.cash || 0)}</Text>
          <MoreCashText level={(this.props.level || 1)} />
          <TouchableHighlight
            underlayColor="transparent"
            onPress={this.levelUp}
          >
            <View style={styles.levelUpButton}>
              <Text style={styles.levelText}>{"Level " + (this.props.level || 1)}</Text>
              <Text style={styles.levelUpText}>{"Level up for " + this.getRequiredCash(this.props.level) + " cash"}</Text>
            </View>
          </TouchableHighlight>
        </View>
        <Lists />
      </View>
    )
  }
}

const mapStateToProps = (state, props) => {
  const user = state.users[auth().currentUser.uid] || {}
  return {
    cash: user.cash || 0,
    level: user.level || 1,
    nickname: user.nickname,
  }
}
const mapDispatchToProps = null
export default connect(mapStateToProps, mapDispatchToProps)(MainComponent)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },

  innerContainer: {
    height: 210,
    width: Dimensions.get("window").width,
    paddingTop: Platform.OS === "ios" ? 40 : 10,
    backgroundColor: "#9b59b6",
    alignItems: "center",
  },

  nicknameInput: {
    color: "white",
    fontSize: 22,
  },

  cashText: {
    fontSize: 25,
    color: "white",
    paddingTop: 20,
  },

  levelText: {
    fontSize: 20,
    color: "white",
    paddingTop: 20,
  },

  levelUpButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  levelUpText: {
    color: "white",
  },
})
