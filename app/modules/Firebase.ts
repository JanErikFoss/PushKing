import reactNativeFirebase from "react-native-firebase"

reactNativeFirebase.config().enableDeveloperMode()
reactNativeFirebase.config().setDefaults({
  cash_per_level_per_interval: 100,
  cash_interval_length: 5 * 60 * 1000,
  cash_intervals_required_for_attack: 3,
})
reactNativeFirebase.config().fetch(0)
  .then(() => reactNativeFirebase.config().activateFetched())
  .then(act => console.log(act ? "Remote config activated" : "Failed to activate remote config"))
  .catch(err => console.log("Failed to fetch firebase remote config: ", err))

export const config = reactNativeFirebase.config
export const auth = reactNativeFirebase.auth
export const fs = reactNativeFirebase.firestore
export const storage = reactNativeFirebase.storage
export const messaging = reactNativeFirebase.messaging
export const notifications = reactNativeFirebase.notifications
export const functions = reactNativeFirebase.functions
export const getTimestamp = reactNativeFirebase.firestore.FieldValue.serverTimestamp
export default reactNativeFirebase
