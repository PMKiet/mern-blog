import { useSelector } from 'react-redux'
import { Outlet, Navigate } from 'react-router-dom'

export default function privateRouter() {
    const { currentUser } = useSelector((state) => state.User)
    return currentUser ? <Outlet /> : <Navigate to='/sign-in' />
}
