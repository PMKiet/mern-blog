import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react'
import { useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { app } from '../firebase'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

export default function CreatePost() {
    const [file, setFile] = useState(null)
    const [uploadImageProgress, setUpdateImageProgress] = useState(null)
    const [uploadImageError, setUpdateImageError] = useState(null)
    const [formData, setFormData] = useState({})
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
    return (
        <div className='p-3 max-w-3xl mx-auto min-h-screen'>
            <h1 className='text-center text-3xl my-7 font-semibold'>Create post</h1>
            <form className='flex flex-col gap-4'>
                <div className='flex flex-col gap-4 sm:flex-row justify-between'>
                    <TextInput type='text' placeholder='Title' required id='title' className='flex-1' />
                    <Select>
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
                <ReactQuill theme='snow' placeholder='Write something...' required className='h-72 mb-12' />
                <Button type='submit' gradientDuoTone='purpleToPink'>Publish</Button>
            </form>
        </div>
    )
}
