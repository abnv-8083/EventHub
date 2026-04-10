import argon2 from "argon2"

export const hashPassword = async (password) =>{
    return argon2.hash(password)
}

export const verifyPassword = async (plainPassword, hashPassword)=>{
    return argon2.verify(hashPassword,plainPassword)
}
