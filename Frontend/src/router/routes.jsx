import {createBrowserRouter} from 'react-router'
import Register from '../features/auth/pages/Register'
import Login from '../features/auth/pages/Login'
import CreateProduct from '../features/product/pages/CreateProduct'

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
    },
    {
        path : '/createProduct',
        element : <CreateProduct />
    }
]) 

export default router