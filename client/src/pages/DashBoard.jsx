import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import DashSideBar from '../components/DashSideBar'
import DashProfile from '../components/DashProfile'
import DashPost from '../components/DashPost'
import DashUsers from '../components/DashUsers'
import DashComments from '../components/DashComment'
import DashBoardComp from '../components/DashBoardComp'

export default function DashBoard() {
    const location = useLocation()
    const [tab, setTab] = useState()
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        const tabFormUrl = urlParams.get('tab')
        if (tabFormUrl) {
            setTab(tabFormUrl)
        }
    }, [location.search])
    return (
        <div className='min-h-screen flex flex-col md:flex-row'>
            <div className='md:w-56'>
                {/* sideBar */}
                <DashSideBar />
            </div>
            {/* Profile */}
            {tab === 'profile' && <DashProfile />}
            {tab === 'posts' && <DashPost />}
            {tab === 'users' && <DashUsers />}
            {tab === 'comments' && <DashComments />}
            {tab === 'dash' && <DashBoardComp />}
        </div>
    )
}
