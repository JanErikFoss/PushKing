import React from "react"
import { View, Text } from "react-native"
import ButtonItem from "./ItemContainer"

export default props => (
  <ButtonItem {...props} >
    <View style={containerStyle}>
      <Text
        allowFontScaling={false}
        style={style}
      >
        {props.value}
      </Text>
    </View>
  </ButtonItem>
)

const containerStyle = {
  justifyContent: "center",
  alignItems: "center",
}
const style = {
  color: "#4B4B4B",
  justifyContent: "center",
}
