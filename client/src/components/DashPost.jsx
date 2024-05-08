import { Table } from "flowbite-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Button, Modal } from 'flowbite-react'
import { RiErrorWarningLine } from "react-icons/ri"


export default function DashPost() {
    const { currentUser } = useSelector((state) => state.User)
    const [userPosts, setUserPosts] = useState([])
    const [showMore, setShowMore] = useState(true)
    const [showModel, setShowModel] = useState(false)
    const [postToDelete, setPostToDelete] = useState('')

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch(`/api/post/getposts?userId=${currentUser._id}`)
                const data = await res.json()
                if (res.ok) {
                    setUserPosts(data.posts)
                    if (data.posts?.length < 9) {
                        setShowMore(false)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        if (currentUser.isAdmin) {
            fetchPosts()
        }
    }, [currentUser._id])
    const handleShowMore = async () => {
        const startIndex = userPosts.length
        try {
            const res = await fetch(`/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`)
            const data = await res.json()
            if (res.ok) {
                setUserPosts((prev) => [...prev, ...data.posts])
                if (data.posts.length < 9) {
                    setShowMore(false)
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleDeletePost = async () => {
        setShowModel(false)
        try {
            const res = await fetch(`/api/post/deletepost/${postToDelete}/${currentUser._id}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (!res.ok) {
                console.log(data.message)
            } else {
                window.location.reload()
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="table-auto overflow-x-auto md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300
        dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
            {currentUser.isAdmin && userPosts.length > 0 ? (
                <>
                    <Table hoverable className="shadow-md">
                        <Table.Head>
                            <Table.HeadCell>Date update</Table.HeadCell>
                            <Table.HeadCell>Post image</Table.HeadCell>
                            <Table.HeadCell>Post title</Table.HeadCell>
                            <Table.HeadCell>Category</Table.HeadCell>
                            <Table.HeadCell>Delete</Table.HeadCell>
                            <Table.HeadCell>
                                <span>Edit</span>
                            </Table.HeadCell>
                        </Table.Head>
                        {userPosts.map((post, i) => (
                            <Table.Body key={i} className="divide-y">
                                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <Table.Cell>{new Date(post.updatedAt).toLocaleDateString()}</Table.Cell>
                                    <Table.Cell>
                                        <Link to={`/post/${post.slug}`}>
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-20 h-10 object-cover bg-gray-500"
                                            />
                                        </Link>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Link className="font-medium text-gray-900 dark:text-white" to={`/post/${post.slug}`}>{post.title}</Link>
                                    </Table.Cell>
                                    <Table.Cell>{post.category}</Table.Cell>
                                    <Table.Cell>
                                        <span onClick={() => {
                                            setShowModel(true)
                                            setPostToDelete(post._id)
                                        }} className="font-medium text-red-500 hover:underline cursor-pointer">
                                            Delete
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Link to={`/post/${post._id}`} className="hover:underline text-teal-500">
                                            <span>Edit</span>
                                        </Link>
                                    </Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        ))}
                    </Table>
                    {
                        showMore && (
                            <button onClick={handleShowMore} className="w-full text-teal-500 self-center text-sm py-7">
                                Show more
                            </button>
                        )
                    }
                </>
            ) : (
                <p>You have no post</p>
            )
            }
            <Modal show={showModel} onClose={() => setShowModel(false)} popup size='md'>
                <Modal.Header />
                <Modal.Body>
                    <div className='text-center'>
                        <RiErrorWarningLine className='h-14 w-14 text-gray-400 dark:text-gray-200 md-4 mx-auto' />
                        <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
                            Are you sure want to delete this post ?
                        </h3>
                        <div className='flex gap-4 justify-center md:justify-end'>
                            <Button color='gray' onClick={() => setShowModel(false)}>
                                No, Cancel
                            </Button>
                            <Button color='failure' onClick={handleDeletePost}>
                                Yes, I'm sure
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div >
    )
}
