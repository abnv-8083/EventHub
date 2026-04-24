import { TIME_SERIES_DUPLICATE_POLICIES } from "redis"
import User from "../../models/users/user.js"

export const checkByEmail = async (email)=>{
    return await User.findOne({ email })
}

export const createUserByData = async (name,email,phone,hashPassword) =>{
    const newUser = new User({
        name:name,
        email:email,
        phone:phone,
        password:hashPassword,
        status: "Active"
    })
    await newUser.save()
    return newUser
}

export const updateStatusByEmail = async (email, status) => {
    return await User.findOneAndUpdate({ email }, { status }, { new: true })
}

export const fetchUserById = async (id, excludeField='')=>{
    return await User.findById(id).select(excludeField)
}

export const editUser = async (id,name, phone, city, bio, gender, age, occupation)=>{
    return await User.findOneAndUpdate({_id:id},{$set:{name:name, phone:phone, city:city, bio:bio, gender:gender, age:age, occupation:occupation}},{new: true})
}

export const editUserAvatar = async (id, avatarUrl) => {
    return await User.findByIdAndUpdate(id, { $set: { avatar_url: avatarUrl } }, { new: true })
}

export const editEmail = async (id, email)=>{
    return await User.findOneAndUpdate({_id:id},{$set:{email:email}},{new: true})
}

export const updatePassword = async (id, hashPassword) => {
    return await User.findByIdAndUpdate(id, { $set: { password: hashPassword } }, { new: true });
}

export const updatePasswordByEmail = async (email, hashPassword) => {
    return await User.findOneAndUpdate({ email }, { $set: { password: hashPassword } }, { new: true });
}

