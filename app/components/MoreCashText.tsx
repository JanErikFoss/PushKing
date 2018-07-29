
import * as React from "react"
import { StyleSheet, Text } from "react-native"

import { config } from "../modules/Firebase"

const getNext = () => {
  const coeff = 1000 * 60 * 5
  return new Date(Math.ceil(Date.now() / coeff) * coeff)
}

const getRemainingString = date => {
  if (!date) return null
  const remaining = (date.getTime() - Date.now()) / 1000
  if (remaining < 1) return null

  const i = Math.floor(remaining)

  if (i < 1) return "0 sec"
  if (i < 60) {
    if (i === 1) return "1 sec"
    return i + " sec"
  }

  const minutes = Math.round(i / 60) || 0
  if (minutes === 1) return "1 min"
  return minutes + " min"
}

interface Props {
  level: number,
}

export default class MoreCashText extends React.Component<Props> {
  cashPerLevelPerInterval = 500
  interval = null

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
    const text = getRemainingString(next) || "0 sec"

    const cash = this.props.level * this.cashPerLevelPerInterval
    const cashText = cash.toLocaleString()

    return <Text style={styles.text}>{"+" + cashText + " in " + text}</Text>
  }
}

const styles = StyleSheet.create({
  text: {
    color: "white",
  }
})
