import { storage } from './firebase'

export async function photoUpload(picture, name) {
    try {
        const snapshot = await storage.ref().child('images/'+name).put(picture, { contentType: 'image/jpg' })
        const downloadUrl = await snapshot.ref.getDownloadURL()
        return {
            error: null,
            downloadUrl
        }
    } catch(error) {
        console.error(error)
        return {
            error,
            downloadUrl: null
        }
    }
}