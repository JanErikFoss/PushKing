import * as React from "react"
import { Dimensions } from "react-native"
import { TabView, TabBar, SceneMap } from "react-native-tab-view"

import Attacks from "./Attacks"
import TopList from "./TopList"
import FriendsList from "./FriendsList"

export default class TabViewExample extends React.Component {
  state = {
    index: 0,
    routes: [
      { key: "attacks", title: "Attacks" },
      { key: "friends", title: "Friends" },
      { key: "top", title: "Top" },
    ],
  }

  renderTabBar = props => (
    <TabBar
      {...props}
      style={{ backgroundColor: "#9b59b6" }}
      indicatorStyle={{ backgroundColor: "white" }}
    />
  )

  render() {
    return (
      <TabView
        navigationState={this.state}
        renderScene={SceneMap({
          attacks: Attacks,
          top: TopList,
          friends: FriendsList,
        })}
        onIndexChange={index => this.setState({ index })}
        initialLayout={{ width: Dimensions.get("window").width, height: 0 }}
        renderTabBar={this.renderTabBar}
      />
    )
  }
}
