
import { Alert } from "react-native"

import ReduxStore from "./ReduxStore"
import { auth, fs, functions } from "./Firebase"

import * as T from "../types"

const cloudFunctionAttack = functions().httpsCallable("attack")

export const toggleFriend = (uid: string) => {
  const localUser = ReduxStore.getState().users[auth().currentUser.uid]
  if (!localUser) return console.log("Local user not found in redux store")

  const isFriends = localUser.friends && localUser.friends[uid]

  isFriends
    ? console.log("Removing " + uid + " from friends list")
    : console.log("Adding " + uid + " to friends list")

  return fs().doc("users/" + auth().currentUser.uid).update({ ["friends." + uid]: !isFriends })
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
  return attack(uid)
}

export const defend = (attack: T.Attack): Promise<void> => Promise.resolve()
  .then(() => console.log("Defending attack: ", attack))
  .then(() => fs().doc("attacks/" + attack.attackId).update({ defended: true, state: "finished" }))
  .then(() => console.log("Successfully defended"))
  .catch(err => {
    console.log("Failed to defend against attack: ", err)
    Alert.alert("Something went wrong", err.message)
  })

export const attack = (uid: string): Promise<void> => Promise.resolve()
  .then(() => console.log("Attacking user: ", uid))
  .then(() => cloudFunctionAttack({ defender: uid }))
  .then(res => console.log("AttackId: ", res.data.attackId))
  .catch(err => {
    console.log("Error attacking " + uid + ": ", err)
    Alert.alert("Something went wrong", err.message)
  })
