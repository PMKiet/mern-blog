import { Avatar, Button, Dropdown, Navbar, TextInput } from "flowbite-react"
import { Link, useLocation } from "react-router-dom"
import { IoSearchOutline } from "react-icons/io5"
import { FaMoon } from "react-icons/fa"
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from "../redux/Theme/themeSlice"

export default function Header() {
    const currentUser = useSelector((state) => state.User.currentUser)
    const dispatch = useDispatch()
    const path = useLocation().pathname
    return (
        <Navbar className="border-b-2">
            <Link to='/' className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white">
                <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">MERN</span>
                Blog
            </Link>
            <form >
                <TextInput
                    type="text"
                    placeholder="Search..."
                    rightIcon={IoSearchOutline}
                    className="hidden lg:inline"
                />
            </form>

            <Button className="w-12 h-10 outline-none lg:hidden" color='gray' pill>
                <IoSearchOutline />
            </Button>
            <div className="flex gap-2 md:order-2">
                <Button className="w-12 h-10 sm:inline hidden" color='gray' pill onClick={() => dispatch(toggleTheme())}>
                    <FaMoon />
                </Button>
                {currentUser ? (
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                            <Avatar
                                alt="User image"
                                img={currentUser.profilePicture}
                                rounded
                            />
                        }
                    >
                        <Dropdown.Header>
                            <span className="block">@{currentUser.username}</span>
                            <span className="block">{currentUser.email}</span>
                        </Dropdown.Header>
                        <Link to='/dashboard?tab=profile'>
                            <Dropdown.Item>Profile</Dropdown.Item>
                        </Link>
                        <Dropdown.Divider />
                        <Dropdown.Item>Log out</Dropdown.Item>

                    </Dropdown>

                ) : (
                    <Link to='/sign-in'>
                        <Button gradientDuoTone='purpleToBlue' outline>
                            Sign In
                        </Button>
                    </Link>
                )}

                <Navbar.Toggle />
            </div>
            <Navbar.Collapse>
                <Navbar.Link as='div' active={path === '/'}>
                    <Link to='/'>
                        Home
                    </Link>
                </Navbar.Link>
                <Navbar.Link as='div' active={path === '/about'}>
                    <Link to='/about'>
                        About
                    </Link>
                </Navbar.Link>
                <Navbar.Link as='div' active={path === '/project'}>
                    <Link to='/project'>
                        Project
                    </Link>
                </Navbar.Link>
            </Navbar.Collapse>
        </Navbar>
    )
}
