import * as React from "react"
import { StyleSheet, View, FlatList, DeviceInfo } from "react-native"

import UserAttackItem from "./UserAttackItem"
import UserFriendItem from "./UserFriendItem"

interface Props {
  isFriendsList?: boolean,
  data: Object[],
  onPress?: (uid: string) => void,
  onLongPress?: (uid: string) => void,
}

const renderSeparator = (sectionId, rowId) => <View style={{ flex: 1, height: 1, backgroundColor: "#dedede" }} key={rowId} />
const keyExtractor = item => item

export default class ListPure extends React.Component<Props> {
  renderItem = ({ item }) => {
    console.log("Rendering: ", this.props.isFriendsList)
    return this.props.isFriendsList
      ? <UserFriendItem uid={item} onPress={this.props.onPress} onLongPress={this.props.onLongPress} />
      : <UserAttackItem uid={item} onPress={this.props.onPress} onLongPress={this.props.onLongPress} />
  }

  render() {
    return (
      <FlatList style={styles.list}
        data={this.props.data}
        renderItem={this.renderItem}
        ItemSeparatorComponent={renderSeparator}
        keyExtractor={keyExtractor}
        automaticallyAdjustContentInsets={false}
        contentInset={{ bottom: DeviceInfo.isIPhoneX_deprecated ? 20 : 0 }}
      />
    )
  }
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: "#dedede",
  },

  separator: {
    flex: 1,
    height: 1,
    backgroundColor: "#dedede",
  },
})
