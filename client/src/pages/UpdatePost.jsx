import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react'
import { useEffect, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { app } from '../firebase'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { useNavigate, useParams } from "react-router-dom"
import { useSelector } from 'react-redux'

export default function UpdatePost() {
    const [file, setFile] = useState(null)
    const [uploadImageProgress, setUpdateImageProgress] = useState(null)
    const [uploadImageError, setUpdateImageError] = useState(null)
    const [formData, setFormData] = useState({})
    const [publishError, setPublishError] = useState(null)
    const navigate = useNavigate()
    const { postId } = useParams()
    const { currentUser } = useSelector((state) => state.User)

    useEffect(() => {
        console.log(postId, formData);
        try {
            const fetchPost = async () => {
                const res = await fetch(`/api/post/getposts?postId=${postId}`)
                const data = await res.json()
                if (!res.ok) {
                    console.log(data);
                    console.log(data.message)
                    setPublishError(data.message)
                    return
                }
                if (res.ok) {
                    setPublishError(null)
                    setFormData(data.posts[0])
                    console.log('data.posts', data.posts);
                }
            }
            fetchPost()
        } catch (error) {
            console.log(error.message)
        }
    }, [postId])

    const handleUpdateImage = async () => {
        try {
            if (!file) {
                setUpdateImageError('Please select an image')
                return
            }
            setUpdateImageError(null)
            const storage = getStorage(app)
            const fileName = new Date().getTime() + '-' + file.name
            const storageRef = ref(storage, fileName)
            const uploadTask = uploadBytesResumable(storageRef, file)
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const process = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    setUpdateImageProgress(process.toFixed(0))
                },
                (error) => {
                    setUpdateImageError('Image upload failed')
                    setUpdateImageProgress(null)
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setUpdateImageProgress(null)
                        setUpdateImageError(null)
                        setFormData({ ...formData, image: downloadURL })
                    })
                }

            )
        } catch (error) {
            setUpdateImageError('Image upload failed')
            setUpdateImageProgress(null)
            console.log(error)
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            console.log('res', res);
            const data = await res.json()
            if (!res.ok) {
                setPublishError(data.message)
            }
            if (res.ok) {
                setPublishError(null)
                navigate(`/post/${data.slug}`)
            }
        } catch (error) {
            console.log(error);
            setPublishError('Something Wrong')
        }
    }
    return (
        <div className='p-3 max-w-3xl mx-auto min-h-screen'>
            <h1 className='text-center text-3xl my-7 font-semibold'>Update post</h1>
            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                <div className='flex flex-col gap-4 sm:flex-row justify-between'>
                    <TextInput
                        type='text'
                        placeholder='Title'
                        required id='title'
                        className='flex-1'
                        onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value })
                        }}
                        value={formData.title}
                    />
                    <Select
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        value={formData.category}
                    >
                        <option value='uncategorized'>Select a category</option>
                        <option value='javascrip'>JavaScript</option>
                        <option value='reactjs'>ReactJs</option>
                        <option value='nextjs'>NextJs</option>
                    </Select>
                </div>
                <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
                    <FileInput type='file' accept='image/*' onChange={(e) => setFile(e.target.files[0])} />
                    <Button type='button' gradientDuoTone='purpleToBlue' size='sm' outline onClick={handleUpdateImage} disabled={uploadImageProgress}>
                        {
                            uploadImageProgress ? (
                                <div className='w-16 h-17'>
                                    <CircularProgressbar value={uploadImageProgress} />
                                </div>
                            ) : ('Upload Image')
                        }
                    </Button>
                </div>
                {uploadImageError && <Alert color='failure'>{uploadImageError}</Alert>}
                {formData && formData.image && (
                    <img src={formData.image} alt='image' className='w-full h-17 object-cover' />
                )}
                <ReactQuill
                    value={formData.content}
                    theme='snow'
                    placeholder='Write something...'
                    required className='h-72 mb-12'
                    onChange={(value) => setFormData({ ...formData, content: value })}
                />
                <Button type='submit' gradientDuoTone='purpleToPink'>Update</Button>
                {publishError && <Alert color='failure'>{publishError}</Alert>}
            </form>
        </div>
    )
}
