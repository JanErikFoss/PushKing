
import * as React from "react"
import { StyleSheet, Text } from "react-native"

import { config } from "../modules/Firebase"

const getNext = () => {
  const coeff = 1000 * 60 * 5
  return new Date(Math.ceil(Date.now() / coeff) * coeff)
}

getRemainingString = date => {
  if (!date) return null
  const remaining = (date.getTime() - Date.now()) / 1000
  if (remaining < 1) return null

  const i = Math.floor(remaining)

  if (i < 1) return "0 sec"
  if (i < 60) {
    if (i === 1) return "1 sec"
    return i + " sec"
  }
  if (i < 3600) {
    const minutes = Math.round(i / 60) || 0
    if (minutes === 1) return "1 min"
    return minutes + " min"
  }
  const hours = Math.round(i / 3600)
  if (hours === 1) return "1 hour"
  return hours + " hours"
}

export default class MoreCashText extends React.Component {
  cashPerLevelPerInterval = 500

  componentDidMount() {
    this.update()
    this.interval = setInterval(this.update, 1000)
  }
  componentWillMount() {
    clearInterval(this.interval)
  }

  update = async () => {
    try {
      const data = await config().getValue("cash_per_level_per_interval")
      this.cashPerLevelPerInterval = data.val()
      this.forceUpdate()
    } catch (err) {
      console.log("Failed to update MoreCashText: ", err)
    }
  }

  render() {
    const next = getNext()
    const text = getRemainingString(next)
    if (!text) {
      console.log("Not rendering MoreCashText")
      return null
    }

    const cash = this.props.level * this.cashPerLevelPerInterval

    return <Text style={styles.text}>{"+" + cash + " in ~" + text}</Text>
  }
}

const styles = StyleSheet.create({
  text: {
    color: "white",
  }
})