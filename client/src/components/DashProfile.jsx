import { Alert, Button, Modal, TextInput } from 'flowbite-react'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase'
import { Link } from 'react-router-dom'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { updateStart, updateSuccess, updateFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signOutSuccess } from '../redux/user/userSlice'
import { RiErrorWarningLine } from "react-icons/ri"

export default function DashProfile() {
    const { currentUser, loading, error } = useSelector((state) => state.User)
    const [imageFile, setImageFile] = useState(null)
    const [imageFileUrl, setImageFileUrl] = useState(null)
    const [imageFileIpLoadProgress, setImageFileIpLoadProgress] = useState(null)
    const [imageFileUpLoadError, setImageFileUpLoadError] = useState(null)
    const [imageFileUpLoading, setImageFileUpLoading] = useState(false)
    const [updateUserSuccess, setUpdateUserSuccess] = useState(null)
    const [updateUserError, setUpdateUserError] = useState(null)
    const [showModel, setShowModel] = useState(false)
    const [formData, setFormData] = useState({})
    const dispatch = useDispatch()
    const filePickerRef = useRef()
    const handleChangeImage = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImageFileUrl(URL.createObjectURL(file))
        }
    }
    useEffect(() => {
        if (imageFile) {
            uploadImage()
        }
    }, [imageFile])
    const uploadImage = async () => {
        setImageFileUpLoading(true)
        setImageFileUpLoadError(null)
        // service firebase.storage {
        //     match /b/{bucket}/o {
        //       match /{allPaths=**} {
        //         allow read, write: if
        //         request.resource.size < 2 * 1024 * 1024 &&
        //         request.resource.contentType.matches('image/*')
        //       }
        //     }
        //   }

        const storage = getStorage(app)
        const fileName = new Date().getTime() + imageFile.name
        const storageRef = ref(storage, fileName)
        const uploadTask = uploadBytesResumable(storageRef, imageFile)
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                setImageFileIpLoadProgress(progress.toFixed(0))
            },
            (error) => {
                console.log(error);
                setImageFileUpLoadError('Could not upload image (File must be less than 2MB')
                setImageFileIpLoadProgress(null)
                setImageFile(null)
                setImageFileUrl(null)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImageFileUrl(downloadURL)
                    setFormData({
                        ...formData, profilePicture: downloadURL
                    })
                    setImageFileUpLoading(false)
                })
            }
        )
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setUpdateUserSuccess(null)
        setUpdateUserError(null)
        if (Object.keys(formData).length === 0) {
            setUpdateUserError('No change made')
            return
        }
        if (imageFileUpLoading) {
            setUpdateUserError('Please wait for image upload')
            return
        }
        try {
            dispatch(updateStart())
            const res = await fetch(`api/user/update/${currentUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            console.log('data', data);
            if (!res.ok) {
                dispatch(updateFailure(data.message))
                setUpdateUserError(data.message)
            }
            else {
                dispatch(updateSuccess(data))
                setUpdateUserSuccess('Update user profile successfully')
            }
        } catch (error) {
            dispatch(updateFailure(error.message))
            setUpdateUserError(error.message)
        }
    }

    const handleDeleteUser = async () => {
        setShowModel(false)
        try {
            dispatch(deleteUserStart())
            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (!res.ok) {
                dispatch(deleteUserFailure(data.message))
            } else {
                dispatch(deleteUserSuccess(data))
            }
        } catch (error) {
            dispatch(deleteUserFailure(error.message))
        }
    }

    const handleSignOut = async () => {
        try {
            const res = await fetch('/api/user/signout', {
                method: 'POST'
            })
            const data = await res.json()
            if (!res.ok) {
                console.log(data.message)
            } else {
                dispatch(signOutSuccess())
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='max-w-lg mx-auto w-full'>
            <h1 className='my-7 text-center font-semibold text-3xl'>Profile</h1>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <input type='file' accept='image/.*' onChange={handleChangeImage} ref={filePickerRef} hidden></input>
                <div className='relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full' onClick={() => filePickerRef.current.click()}>
                    {imageFileIpLoadProgress && (
                        <CircularProgressbar value={imageFileIpLoadProgress || 0}
                            strokeWidth={5}
                            styles={{
                                root: {
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                path: {
                                    stroke: `rgba(62,152,199,${imageFileIpLoadProgress / 100})`
                                }
                            }}
                        />
                    )}
                    <img src={imageFileUrl || currentUser.profilePicture} alt={currentUser.username}
                        className={`rounded-full w-full h-full border-8 object-cover border-[lightgray]
                        ${imageFileIpLoadProgress && imageFileIpLoadProgress < 100 && 'opacity-60'}`}
                    />
                </div>
                {imageFileUpLoadError && <Alert color='failure'>{imageFileUpLoadError}</Alert>}
                <TextInput
                    type='text'
                    id='username'
                    placeholder='Name'
                    defaultValue={currentUser.username}
                    onChange={handleChange}
                />
                <TextInput
                    type='email'
                    id='email'
                    placeholder='Email'
                    defaultValue={currentUser.email}
                    onChange={handleChange}
                />
                <TextInput
                    type='password'
                    id='password'
                    placeholder='password'
                    defaultValue='********'
                    onChange={handleChange}
                />
                <Button type='submit' gradientDuoTone='purpleToBlue' outline disabled={loading || imageFileUpLoading}>
                    {loading ? 'Loading...' : 'Update'}
                </Button>
                {
                    currentUser.isAdmin && (
                        <Link to={'/create-post'}>
                            <Button
                                type='button'
                                gradientDuoTone='purpleToPink'
                                className='w-full'
                            >
                                Create a post
                            </Button>
                        </Link>
                    )
                }
            </form>
            <div className="text-red-500 flex justify-between mt-5">
                <span onClick={() => setShowModel(true)} className='cursor-pointer'>Delete Account</span>
                <span onClick={handleSignOut} className='cursor-pointer'>Sign Out</span>
            </div>
            {updateUserSuccess &&
                <Alert color='success' className='mt-5'>
                    {updateUserSuccess}
                </Alert>}
            {updateUserError &&
                <Alert color='warning' className='mt-5'>
                    {updateUserError}
                </Alert>}
            {error &&
                <Alert color='warning' className='mt-5'>
                    {error}
                </Alert>}
            <Modal show={showModel} onClose={() => setShowModel(false)} popup size='md'>
                <Modal.Header />
                <Modal.Body>
                    <div className='text-center'>
                        <RiErrorWarningLine className='h-14 w-14 text-gray-400 dark:text-gray-200 md-4 mx-auto' />
                        <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
                            Are you sure want to delete your account ?
                        </h3>
                        <div className='flex gap-4 justify-center md:justify-end'>
                            <Button color='gray' onClick={() => setShowModel(false)}>
                                No, Cancel
                            </Button>
                            <Button color='failure' onClick={handleDeleteUser}>
                                Yes, I'm sure
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}
