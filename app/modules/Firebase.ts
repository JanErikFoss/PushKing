import reactNativeFirebase from "react-native-firebase"

// reactNativeFirebase.config().enableDeveloperMode()
// reactNativeFirebase.config().setDefaults({ })

export const auth = reactNativeFirebase.auth
export const fs = reactNativeFirebase.firestore
export const storage = reactNativeFirebase.storage
export const messaging = reactNativeFirebase.messaging
export const notifications = reactNativeFirebase.notifications
export const functions = reactNativeFirebase.functions
export const getTimestamp = reactNativeFirebase.firestore.FieldValue.serverTimestamp
export default reactNativeFirebase
