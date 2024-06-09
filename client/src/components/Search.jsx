import { Button, Select, TextInput } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PostCard from './PostCard'

export default function Search() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [showMore, setShowMore] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarData, setSidebarData] = useState({
        searchTerm: '',
        sort: 'desc',
        category: 'uncategorized'
    })
    const handleShowMore = async () => {
        const numberOfPosts = posts.length
        const startIndex = numberOfPosts
        const urlParams = new URLSearchParams(location.search)
        urlParams.set('startIndex', startIndex)
        const searchQuery = urlParams.toString()
        const res = await fetch(`/api/post/getposts?${searchQuery}`)
        if (!!res.ok) {
            return
        }
        if (res.ok) {
            const data = res.json()
            setPosts([...posts, ...data.posts])
            if (data.posts.length === 9) {
                setShowMore(true)
            } else {
                setShowMore(false)
            }
        }
    }
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        const searchTermFromUrl = urlParams.get('searchTerm')
        const sortFromUrl = urlParams.get('sort')
        const categoryFromUrl = urlParams.get('category')
        if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
            setSidebarData({
                ...sidebarData,
                searchTerm: searchTermFromUrl,
                sort: sortFromUrl,
                category: categoryFromUrl
            })
        }

        const fetchPosts = async () => {
            setLoading(true)
            const searchQuery = urlParams.toString()
            const res = await fetch(`/api/post/getposts?${searchQuery}`)
            if (!res.ok) {
                setLoading(false)
                return
            }

            if (res.ok) {
                const data = await res.json()
                setPosts(data.posts)
                setLoading(false)
                if (data.posts.length === 9) {
                    setShowMore(true)
                } else {
                    setShowMore(false)
                }
            }
        }
        fetchPosts()
    }, [location.search])

    const handleOnchange = (e) => {
        if (e.target.id === 'searchTerm') {
            setSidebarData({ ...sidebarData, searchTerm: e.target.value })
        }
        if (e.target.id === 'sort') {
            const order = e.target.value || 'desc'
            setSidebarData({ ...sidebarData, sort: order })
        }
        if (e.target.id === 'category') {
            const category = e.target.value || 'uncategorized'
            setSidebarData({ ...sidebarData, category })
        }
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        const urlParams = new URLSearchParams(location.search)
        urlParams.set('searchTerm', sidebarData.searchTerm)
        urlParams.set('sort', sidebarData.sort)
        urlParams.set('category', sidebarData.category)
        const searchQuery = urlParams.toString()
        navigate(`/search?${searchQuery}`)
    }
    return (
        <div className='flex flex-col md:flex-row'>
            <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
                <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                    <div className="flex items-center gap-2">
                        <label className='whitespace-nowrap font-semibold' htmlFor="searchTerm">Search Term:</label>
                        <TextInput
                            placeholder='Search'
                            id='searchTerm'
                            type='text'
                            onChange={handleOnchange}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="sort" className='font-semibold'>Sort:</label>
                        <Select
                            onChange={handleOnchange}
                            value={sidebarData.sort}
                            id='sort'
                        >
                            <option value='desc'>Oldest</option>
                            <option value='asc'>Latest</option>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="sort" className='font-semibold'>Category:</label>
                        <Select
                            onChange={handleOnchange}
                            value={sidebarData.category}
                            id='category'
                        >
                            <option value='uncategorized'>Uncategorized</option>
                            <option value='reactjs'>React.Js</option>
                            <option value='nextjs'>Next.Js</option>
                            <option value='javascript'>JavaScript.Js</option>
                        </Select>
                    </div>
                    <Button
                        type='submit' outline gradientDuoTone='purpleToPink'
                    >
                        Apply Filters
                    </Button>
                </form>
            </div>
            <div className="w-full">
                <h1 className='text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5'>Post results</h1>
                <div className="p-7 flex flex-wrap gap-4">
                    {
                        !loading && posts && posts.length === 0 && (
                            <p className='text-xl text-gray-500'>No posts found</p>
                        )
                    }
                    {
                        loading && <p className='text-xl text-gray-500'>Loading...</p>
                    }
                    {!loading && posts && posts.map((post) => <PostCard key={post._id} post={post} />)}
                    {
                        showMore &&
                        <button onClick={handleShowMore} className='text-teal-500 text-lg hover:underline p-7 w-full'>
                            Show More
                        </button>
                    }
                </div>
            </div>
        </div>
    )
}
