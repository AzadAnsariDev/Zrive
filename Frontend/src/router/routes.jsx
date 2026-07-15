import {createBrowserRouter} from 'react-router'
import Register from '../features/auth/pages/Register'
import Login from '../features/auth/pages/Login'

const router = createBrowserRouter([
    {
        path : '/',
        element : <h1>Hello to Zrive</h1>
    },
    {
        path : '/register',
        element : <Register />
    },
    {
        path : '/login',
        element : <Login />
    }
]) 

export default router