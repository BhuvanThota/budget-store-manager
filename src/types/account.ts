// src/types/account.ts

export interface AccountData {
    provider: string
    createdAt: Date
  }
  
  export interface UserWithAccounts {
    id: string
    name: string | null
    email: string
    image: string | null
    password: string | null
    createdAt: Date
    accounts: AccountData[]
  }