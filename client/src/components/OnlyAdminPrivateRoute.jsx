import { useSelector } from 'react-redux'
import { Outlet, Navigate } from 'react-router-dom'

export default function OnlyAdminPrivateRoute() {
    const { currentUser } = useSelector((state) => state.User)
    return currentUser.isAdmin ? <Outlet /> : <Navigate to='/sign-in' />
}
