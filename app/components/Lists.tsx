import * as React from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import { TabView, TabBar, SceneMap } from "react-native-tab-view"

import Attacks from "./Attacks"
import TopList from "./TopList"
import FriendsList from "./FriendsList"
import SearchList from "./SearchList"

export default class TabViewExample extends React.Component {
  state = {
    index: 0,
    routes: [
      { key: "attacks", title: "Attacks" },
      { key: "friends", title: "Friends" },
      { key: "top", title: "Top" },
    ],
  }

  render() {
    return (
      <TabView
        navigationState={this.state}
        renderScene={SceneMap({
          attacks: Attacks,
          top: TopList,
          friends: FriendsList,
          search: SearchList,
        })}
        onIndexChange={index => this.setState({ index })}
        initialLayout={{ width: Dimensions.get("window").width, height: 0 }}
      />
    )
  }
}
