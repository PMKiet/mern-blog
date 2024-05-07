import { Sidebar } from 'flowbite-react'
import { HiUser, HiArrowSmRight, HiDocumentText } from "react-icons/hi"
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function DashSideBar() {
    const location = useLocation()
    const { currentUser } = useSelector((state) => state.User)
    const [tab, setTab] = useState()
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        const tabFormUrl = urlParams.get('tab')
        if (tabFormUrl) {
            setTab(tabFormUrl)
        }
    }, [location.search])
    return (
        <Sidebar className='w-full md:w-56'>
            <Sidebar.Items>
                <Sidebar.ItemGroup className='flex flex-col gap-1'>
                    <Link to='/dashboard?tab=profile'>
                        <Sidebar.Item
                            active={tab === 'profile'}
                            label={currentUser.isAdmin ? 'Admin' : 'User'}
                            icon={HiUser}
                            labelColor='dark'
                            as='div'
                        >
                            Profile
                        </Sidebar.Item>
                    </Link>
                    {currentUser.isAdmin &&
                        <Link to='/dashboard?tab=posts'>
                            <Sidebar.Item
                                active={tab === 'posts'}
                                icon={HiDocumentText}
                                as='div'
                            >
                                Posts
                            </Sidebar.Item>
                        </Link>
                    }
                    <Sidebar.Item icon={HiArrowSmRight} className='cursor-pointer'>
                        Log out
                    </Sidebar.Item>
                </Sidebar.ItemGroup>
            </Sidebar.Items>
        </Sidebar>
    )
}
