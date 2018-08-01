
import { Alert } from "react-native"

import { setUser } from "../actions"
import ReduxStore from "./ReduxStore"
import { auth, fs, functions, config } from "./Firebase"

import * as T from "../types"

interface UserListeners {
  [tag: string]: { [uid: string]: () => void }
}

const cloudFunctionAttack = functions().httpsCallable("attack")

let unmounted = false
export const unmount = () => {
  unmounted = true
  Object.values(userListeners).forEach(tagObject => {
    Object.values(tagObject).forEach(listener => listener && listener())
  })
}

const userListeners: UserListeners = {}
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

export const toggleFriend = async (uid: string, val?: boolean) => {
  const localUser = ReduxStore.getState().users[auth().currentUser.uid]
  if (!localUser) return console.log("Local user not found in redux store")

  const isFriends = localUser.friends && localUser.friends[uid]
  const newVal = val === undefined ? !isFriends : val

  newVal
    ? console.log("Removing " + uid + " from friends list")
    : console.log("Adding " + uid + " to friends list")

  try {
    await fs().doc("users/" + auth().currentUser.uid).update({ ["friends." + uid]: newVal })
    console.log("Friend status changed")
  } catch (err) {
    console.log("Failed to change friend status: ", err)
    Alert.alert("Something went wrong", err.message)
  }
}

export const actionOnUser = async (uid: string) => {
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

    const state = ReduxStore.getState()
    const attack = state.attacks.outgoing[uid]
    if (attack) throw new Error("Already attacking that user")

    const localUser = state.users[auth().currentUser.uid]
    if (!localUser) throw new Error("User not loaded, please try again")

    const [cashPerInterval, requiredMultiplier] = await Promise.all([
      config().getValue("cash_per_level_per_interval"),
      config().getValue("cash_intervals_required_for_attack"),
    ])
    const requiredCash = localUser.level * cashPerInterval.val() * requiredMultiplier.val()
    if (localUser.cash < requiredCash) {
      return Alert.alert("Not enough cash", "You need at least " + requiredCash + " to attack someone")
    }

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
    const user = ReduxStore.getState().users[uid] || {}

    await fs().collection("reports").add({
      reason,
      reporter: auth().currentUser.uid,
      reported: uid,
      nickname: user.nickname,
    })
    Alert.alert("Thank you", "Your report has been logged")
  } catch (err) {
    console.log("Failed to report user: ", err)
    Alert.alert("Something went wrong", err.message)
  }
}
