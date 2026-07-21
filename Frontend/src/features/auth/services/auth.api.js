import axios from 'axios'

const authApiInstance = axios.create({
    baseURL : "/api/auth",
    withCredentials: true
})


export const register = async (email, contact, username, password, isSeller = false)=>{
    const response = await authApiInstance.post("/register", {
        email, 
        contact,
        username,
        password,
        isSeller
    })

    return response.data
}

export const login = async (identifier, password)=>{
    const response = await authApiInstance.post("/login", {
        identifier,
        password
    })
    return response.data
}


export const getMe = async () => {
  try {
    console.log("Before API");

    const response = await authApiInstance.get("/get-me");

    console.log("After API", response);

    return response.data;
  } catch (err) {
    console.log("GET ME ERROR", err);
    throw err;
  }
};
