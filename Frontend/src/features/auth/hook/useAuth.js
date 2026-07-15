import { useDispatch } from "react-redux"
import { login, register } from "../services/auth.api"
import { setError, setLoading } from "../state/authSlice"

export const useAuth = () =>{

    const dispatch = useDispatch()

    const handleRegister = async (email, contact, username, password, isSeller)=>{
        dispatch(setLoading(true))
        try{
            const data = await register(email, contact, username, password, isSeller)
            return data
        }catch(err){
            console.log(err)
            dispatch(setError(err.response?.data?.message || err.message))
        }finally{
            dispatch(setLoading(false))
        }
    }
    const handleLogin = async (identifier, password)=>{
        dispatch(setLoading(true))
        try{
            const data = await login(identifier, password)
            return data
        }catch(err){
            console.log(err)
            dispatch(setError(err.response?.data?.message || err.message))
            throw err
        }finally{
            dispatch(setLoading(false))
        }
    }

    return {
        handleRegister,
        handleLogin
    }
}