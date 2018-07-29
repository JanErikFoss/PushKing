
import { Alert } from "react-native"

import { setUser } from "../actions"
import ReduxStore from "./ReduxStore"
import { auth, fs, functions } from "./Firebase"

import * as T from "../types"

const cloudFunctionAttack = functions().httpsCallable("attack")

let unmounted = false
export const unmount = () => {
  unmounted = true
  Object.values(userListeners).forEach(listener => listener && listener())
}

const userListeners = {}
export const monitorUser = (uid: string) => {
  if (!uid) return console.log("Tried to monitor null uid")
  if (userListeners[uid]) return
  console.log("Monitoring user: ", uid)

  const onError = err => {
    console.log("User listener error: ", err)
    setTimeout(() => !unmounted && monitorUser(uid), 1000)
  }
  const onSnapshot = doc => {
    const data = doc.exists && doc.data()
    if (!data) return console.log("User does not exist: " + uid)
    ReduxStore.dispatch({ uid, payload: data, type: setUser })
  }

  userListeners[uid] = fs().doc("users/" + uid).onSnapshot(onSnapshot, onError)
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

  const incoming = attacks.incoming[uid]
  if (incoming) return defend(incoming)

  const outgoing = attacks.outgoing[uid]
  if (outgoing) return Alert.alert("Already attacking", "You are already attacking this person")
  return attackUser(uid)
}

export const defend = (attack: T.Attack): Promise<void> => Promise.resolve()
  .then(() => console.log("Defending attack: ", attack))
  .then(() => fs().doc("attacks/" + attack.attackId).update({ defended: true, state: "finished" }))
  .then(() => console.log("Successfully defended"))
  .catch(err => {
    console.log("Failed to defend against attack: ", err)
    Alert.alert("Something went wrong", err.message)
  })

export const attackUser = (uid: string): Promise<void> => Promise.resolve()
  .then(() => console.log("Attacking user: ", uid))
  .then(() => cloudFunctionAttack({ defender: uid }))
  .then(res => console.log("AttackId: ", res.data.attackId))
  .catch(err => {
    console.log("Error attacking " + uid + ": ", err)
    Alert.alert("Something went wrong", err.message)
  })
