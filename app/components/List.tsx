import * as React from "react"
import { StyleSheet, View, FlatList, DeviceInfo } from "react-native"

import UserItem from "./UserItem"

interface Props {
  data: Object[],
  onPress: (uid: string) => void,
}

const renderSeparator = (sectionId, rowId) => <View style={{ flex: 1, height: 1, backgroundColor: "#dedede" }} key={rowId} />
const keyExtractor = (item, index) => index.toString()

export default class List extends React.Component<Props> {
  renderItem = ({ item }) => <UserItem uid={item} onPress={this.props.onPress} />

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
    /// flex: 1,
    backgroundColor: "#dedede",
  },

  separator: {
    flex: 1,
    height: 1,
    backgroundColor: "#dedede",
  },
})
