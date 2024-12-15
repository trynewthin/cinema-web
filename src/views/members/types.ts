export type Member = {
  memberId: string
  name: string
  password: string
  birthday: string
  sex: string
}

export type MemberQuery = {
  pageIndex: number
  pageSize: number
  name?: string
  birthdayQuery?: string
}
