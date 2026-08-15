import { useDispatch } from "react-redux"
import {
    getMe,
    login,
    register,
    updateProfile,
    changePassword,
    logout
} from "../services/auth.api"
import {
    setError,
    setLoading,
    setUser,
    setUpdateLoading,
    setPasswordLoading
} from "../state/authSlice"

export const useAuth = () => {

    const dispatch = useDispatch()

    const handleRegister = async (email, contact, username, password) => {
        dispatch(setLoading(true))
        try {
            const data = await register(email, contact, username, password)
            dispatch(setUser(data.user))
            return data.user
        } catch (err) {
            console.log(err)
            dispatch(setError(err.response?.data?.message || err.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleLogin = async (identifier, password) => {
        dispatch(setLoading(true))
        try {
            const data = await login(identifier, password)
            dispatch(setUser(data.user))
            return data.user
        } catch (err) {
            console.log(err)
            dispatch(setError(err.response?.data?.message || err.message))
            throw err
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleGetMe = async () => {
        try {
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch (err) {
            console.log(err)
            dispatch(setError(err.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleUpdateProfile = async (payload) => {
        dispatch(setUpdateLoading(true))
        try {
            const data = await updateProfile(payload)
            dispatch(setUser(data.user))
            return data.user
        } catch (err) {
            console.log(err)
            dispatch(setError(err.response?.data?.message || err.message))
            return null
        } finally {
            dispatch(setUpdateLoading(false))
        }
    }

    const handleChangePassword = async ({ currentPassword, newPassword }) => {
        dispatch(setPasswordLoading(true))
        try {
            const data = await changePassword(currentPassword, newPassword)
            return data
        } catch (err) {
            console.log(err)
            dispatch(setError(err.response?.data?.message || err.message))
            return null
        } finally {
            dispatch(setPasswordLoading(false))
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            dispatch(setUser(null))
        } catch (err) {
            console.log(err)
            dispatch(setError(err.response?.data?.message || err.message))
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleUpdateProfile,
        handleChangePassword,
        handleLogout
    }
}