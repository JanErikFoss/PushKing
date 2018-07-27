import React from "react"
import { View, Text } from "react-native"
import ItemContainer from "./ItemContainer"

export default props => (
  <ItemContainer {...props} value={null} >
    <View style={containerStyle}>
      <Text
        allowFontScaling={false}
        style={style}
      >
        {props.text}
      </Text>
    </View>
  </ItemContainer>
)

const containerStyle = {
  justifyContent: "center",
  alignItems: "center",
}
const style = {
  color: "#4B4B4B",
  justifyContent: "center",
}

