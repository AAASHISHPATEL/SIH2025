import userModel from "../db/models/userModel.js";

export const createUser=async ({name,email, password})=>{

    if(!email || !password || !name) {
        throw new Error("Name, email and password are required");
    }

    const hashedPassword= await userModel.hashPassword(password);

    const user= await userModel.create({name,email, password: hashedPassword});
    if(!user) {
        throw new Error("User not created"); 
    }
    return user;
}