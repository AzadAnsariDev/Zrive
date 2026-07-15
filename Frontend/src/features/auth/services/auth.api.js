import axios from 'axios'

const authApiInstance = axios.create({
    baseURL : "http://localhost:3000",
    withCredentials: true
})


export const register = async (email, contact, username, password, isSeller = false)=>{
    const response = await authApiInstance.post("/api/auth/register", {
        email, 
        contact,
        username,
        password,
        isSeller
    })

    return response.data
}
export const login = async (identifier, password)=>{
    const response = await authApiInstance.post("/api/auth/login", {
        identifier,
        password
    })
    return response.data
}