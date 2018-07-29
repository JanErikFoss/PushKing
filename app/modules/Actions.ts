
import { Alert } from "react-native"

import { setUser } from "../actions"
import ReduxStore from "./ReduxStore"
import { auth, fs, functions } from "./Firebase"

import * as T from "../types"

const cloudFunctionAttack = functions().httpsCallable("attack")

let unmounted = false
export const unmount = () => {
  unmounted = true
  Object.values(userListeners).forEach(tagObject => {
    Object.values(tagObject).forEach(listener => listener && listener())
  })
}

const userListeners = {}
export const monitorUser = (uid: string, tag: string) => {
  console.log("Monitoring user: " + uid + " for " + tag)
  if (!uid) return console.log("Tried to monitor null uid")
  if (userListeners[tag] && userListeners[tag][uid]) return console.log("Already monitoring " + uid + " for " + tag)

  const onError = err => {
    console.log("User listener error: ", err)
    setTimeout(() => !unmounted && monitorUser(uid, tag), 1000)
  }
  const onSnapshot = doc => {
    const data = doc.exists && doc.data()
    if (!data) return console.log("User does not exist: " + uid)
    ReduxStore.dispatch({ uid, payload: data, type: setUser })
  }

  if (!userListeners[tag]) userListeners[tag] = {}
  userListeners[tag][uid] = fs().doc("users/" + uid).onSnapshot(onSnapshot, onError)
}

export const toggleFriend = (uid: string, val?: boolean) => {
  const localUser = ReduxStore.getState().users[auth().currentUser.uid]
  if (!localUser) return console.log("Local user not found in redux store")

  const isFriends = localUser.friends && localUser.friends[uid]
  const newVal = val === undefined ? !isFriends : val

  newVal
    ? console.log("Removing " + uid + " from friends list")
    : console.log("Adding " + uid + " to friends list")

  return fs().doc("users/" + auth().currentUser.uid).update({ ["friends." + uid]: newVal })
    .then(() => console.log("Friend status changed"))
    .catch(err => {
      console.log("Failed to change friend status: ", err)
      Alert.alert("Something went wrong", err.message)
    })
}

export const actionOnUser = (uid: string) => {
  const attacks = ReduxStore.getState().attacks

  if (attacks.incoming[uid]) return defend(uid)

  const outgoing = attacks.outgoing[uid]
  if (outgoing) return Alert.alert("Already attacking", "You are already attacking this person")
  return attackUser(uid)
}

export const defend = async (uid: string) => {
  try {
    console.log("Defending against user: ", uid)
    const attack = ReduxStore.getState().attacks.incoming[uid]
    if (!attack) throw new Error("No attack to defend against")

    await fs().doc("attacks/" + attack.attackId).update({ defended: true, state: "finished" })
    console.log("Successfully defended")
  } catch (err) {
    console.log("Error defending against " + uid + ": ", err)
    Alert.alert("Something went wrong", err.message)
  }
}

export const attackUser = async (uid: string) => {
  try {
    console.log("Attacking user: ", uid)
    const attack = ReduxStore.getState().attacks.outgoing[uid]
    if (attack) throw new Error("Already attacking that user")

    const res = await cloudFunctionAttack({ defender: uid })
    console.log("AttackId: ", res.data.attackId)
  } catch (err) {
    console.log("Error attacking " + uid + ": ", err)
    Alert.alert("Something went wrong", err.message)
  }
}

export const reportUser = async (uid: string, reason: string) => {
  try {
    console.log("Reporting user " + uid)
    await fs().collection("reports").add({
      reason,
      reporter: auth().currentUser.uid,
      reported: uid,
    })
    Alert.alert("Thank you", "Your report has been logged")
  } catch (err) {
    console.log("Failed to report user: ", err)
    Alert.alert("Something went wrong", err.message)
  }
}
