import { Alert, Button, TextInput } from 'flowbite-react'
import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase'
import { CircularProgressbar } from 'react-circular-progressbar'
import { updateStart, updateSuccess, updateFailure } from '../redux/user/userSlice'
import { useDispatch } from 'react-redux'

export default function DashProfile() {
    const { currentUser } = useSelector((state) => state.User)
    const [imageFile, setImageFile] = useState(null)
    const [imageFileUrl, setImageFileUrl] = useState(null)
    const [imageFileIpLoadProgress, setImageFileIpLoadProgress] = useState(null)
    const [imageFileUpLoadError, setImageFileUpLoadError] = useState(null)
    const [imageFileUpLoading, setImageFileUpLoading] = useState(false)
    const [updateUserSuccess, setUpdateUserSuccess] = useState(null)
    const [updateUserError, setUpdateUserError] = useState(null)
    const [formData, setFormData] = useState({})
    const dispatch = useDispatch()
    console.log(imageFileIpLoadProgress, imageFileUpLoadError);
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
                <Button type='submit' gradientDuoTone='purpleToBlue' outline>
                    Update
                </Button>
            </form>
            <div className="text-red-500 flex justify-between mt-5">
                <span className='cursor-pointer'>Delete Account</span>
                <span className='cursor-pointer'>Sign Out</span>
            </div>
            {updateUserSuccess &&
                <Alert color='success' className='mt-5'>
                    {updateUserSuccess}
                </Alert>}
            {updateUserError &&
                <Alert color='warning' className='mt-5'>
                    {updateUserError}
                </Alert>}
        </div>
    )
}
