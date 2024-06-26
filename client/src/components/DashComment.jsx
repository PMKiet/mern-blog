
import { Table } from "flowbite-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Button, Modal } from 'flowbite-react'
import { RiErrorWarningLine } from "react-icons/ri"

export default function DashComments() {
    const { currentUser } = useSelector((state) => state.User)
    const [comments, setComments] = useState([])
    const [showMore, setShowMore] = useState(true)
    const [showModel, setShowModel] = useState(false)
    const [commentIdToDelete, setCommentIdToDelete] = useState('')


    useEffect(() => {
        const fetchComment = async () => {
            try {
                const res = await fetch(`/api/comment/getComments`)
                const data = await res.json()
                if (res.ok) {
                    setComments(data.comments)
                    if (data.comments?.length < 9) {
                        setShowMore(false)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        if (currentUser.isAdmin) {
            fetchComment()
        }
    }, [currentUser._id])
    const handleShowMore = async () => {
        const startIndex = comments.length
        try {
            const res = await fetch(`/api/user/getComments?startIndex=${startIndex}`)
            const data = await res.json()
            if (res.ok) {
                setComments((prev) => [...prev, ...data.comments])
                if (data.comments.length < 9) {
                    setShowMore(false)
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleDeleteComment = async () => {
        setShowModel(false)
        try {
            const res = await fetch(`/api/comment/deleteComment/${commentIdToDelete}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (res.ok) {
                setComments((prev) => prev.filter((comment) => comment._id !== commentIdToDelete))
                setShowModel(false)
            } else {
                console.log(data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="table-auto overflow-x-auto md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300
        dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
            {currentUser.isAdmin && comments.length > 0 ? (
                <>
                    <Table hoverable className="shadow-md">
                        <Table.Head>
                            <Table.HeadCell>Date updated</Table.HeadCell>
                            <Table.HeadCell>Comment content</Table.HeadCell>
                            <Table.HeadCell>Number of likes</Table.HeadCell>
                            <Table.HeadCell>PostId</Table.HeadCell>
                            <Table.HeadCell>UserId</Table.HeadCell>
                            <Table.HeadCell>Delete</Table.HeadCell>
                        </Table.Head>
                        {comments.map((comment, i) => (
                            <Table.Body key={i} className="divide-y">
                                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <Table.Cell>{new Date(comment.updatedAt).toLocaleDateString()}</Table.Cell>
                                    <Table.Cell>
                                        {comment.content}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {comment.numberOfLike}
                                    </Table.Cell>
                                    <Table.Cell>{comment.postId}</Table.Cell>
                                    <Table.Cell>{comment.userId}</Table.Cell>
                                    <Table.Cell>
                                        <span onClick={() => {
                                            setShowModel(true)
                                            setCommentIdToDelete(comment._id)
                                        }} className="font-medium text-red-500 hover:underline cursor-pointer">
                                            Delete
                                        </span>
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
                <p>You have no comment yet!</p>
            )
            }
            <Modal show={showModel} onClose={() => setShowModel(false)} popup size='md'>
                <Modal.Header />
                <Modal.Body>
                    <div className='text-center'>
                        <RiErrorWarningLine className='h-14 w-14 text-gray-400 dark:text-gray-200 md-4 mx-auto' />
                        <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
                            Are you sure want to delete this comment ?
                        </h3>
                        <div className='flex gap-4 justify-center md:justify-end'>
                            <Button color='gray' onClick={() => setShowModel(false)}>
                                No, Cancel
                            </Button>
                            <Button color='failure' onClick={handleDeleteComment}>
                                Yes, I'm sure
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div >
    )
}
