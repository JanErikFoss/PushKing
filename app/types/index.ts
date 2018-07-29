
export interface User {
  uid: string,
  nickname: string,
  cash: number,
  level: number,
  friends: { [uid: string]: boolean },
}

export interface Attack {
  attacker: string,
  defender: string,
  state: string,
  defended: boolean,
  timestamp: Date,
  finishTime: Date,
  attackId: string,
}
