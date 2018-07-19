
import { auth, fs, notifications, messaging } from "../modules/Firebase"

interface UserData {
  fcmTokens: {
    $token: boolean
  },
}

let authStateListener = null
let notificationListener = null

export default class Notifications {
  static shouldSkipPush = (title: string, body: string) => {
    if (title === "example") return true
    return false
  }

  static onPushMessage = message => {
    console.log("Push message received: ", message)
    if (!message.title || !message.body) return console.log("Malformed push message")
    if (Notifications.shouldSkipPush(message.title, message.body)) {
      return console.log("Skipping push message")
    }

    const notification = new notifications.Notification()
      .setNotificationId("notificationId")
      .setTitle(message.title)
      .setBody(message.body)

    notifications().displayNotification(notification)
  }

  static setDeviceTokenInUserData = async (uid: string) => {
    try {
      const [doc, token] = await Promise.all([
        fs().doc("users/" + uid).get(),
        messaging().getToken(),
      ])

      const userData = <UserData> (doc.exists && doc.data() || { fcmTokens: {} })
      const fcmTokens = { ...userData.fcmTokens, [token]: true }

      await fs().doc("users/" + uid).set({ fcmTokens }, { merge: true })
      console.log("fcmTokens successfully saved in user data")
    } catch (err) {
      console.log("Failed to save fcmTokens in user data: ", err)
    }
  }

  static init = async () => {
    console.log("Initializing notifications module")

    try {
      await messaging().requestPermission()
      console.log("Notification permissions granted")
    } catch (err) {
      console.log("Notification permissions denied: ", err)
    }

    authStateListener && authStateListener()
    authStateListener = auth().onAuthStateChanged((user: any) => {
      user && user.uid && Notifications.setDeviceTokenInUserData(user.uid)
    })

    notificationListener && notificationListener()
    notificationListener = notifications().onNotification(Notifications.onPushMessage)
  }

  static unmount = () => {
    authStateListener && authStateListener()
    authStateListener = null

    notificationListener && notificationListener()
    notificationListener = null
  }
}
