import React from "react"
import ItemContainer from "./ItemContainer"

export default props => (
  <ItemContainer
    {...props}
    hideLeftIcon
    showRightIcon
    iconRight={props.icon}
  />
)
