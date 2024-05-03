import { Alert, Button, TextInput } from 'flowbite-react'
import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase'
import { CircularProgressbar } from 'react-circular-progressbar'

export default function DashProfile() {
    const { currentUser } = useSelector((state) => state.User)
    const [imageFile, setImageFile] = useState(null)
    const [imageFileUrl, setImageFileUrl] = useState(null)
    const [imageFileIpLoadProgress, setImageFileIpLoadProgress] = useState(null)
    const [imageFileUpLoadError, setImageFileUpLoadError] = useState(null)
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
        imageFileUpLoadError(null)
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
                })
            }
        )
    }


    return (
        <div className='max-w-lg mx-auto w-full'>
            <h1 className='my-7 text-center font-semibold text-3xl'>Profile</h1>
            <form className='flex flex-col gap-4'>
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
                />
                <TextInput
                    type='email'
                    id='email'
                    placeholder='Email'
                    defaultValue={currentUser.email}
                />
                <TextInput
                    type='password'
                    id='password'
                    placeholder='password'
                    defaultValue='********'
                />
                <Button type='submit' gradientDuoTone='purpleToBlue' outline>
                    Update
                </Button>
            </form>
            <div className="text-red-500 flex justify-between mt-5">
                <span className='cursor-pointer'>Delete Account</span>
                <span className='cursor-pointer'>Sign Out</span>
            </div>
        </div>
    )
}
