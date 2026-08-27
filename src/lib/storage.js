/**
 * Client-side photo storage for Heirloom appraisals
 */

export const storage = {
  async upload(file, fileName) {
    return new Promise((resolve, reject) => {
      if (typeof file === 'string') {
        resolve({ url: file, path: fileName || 'photo' })
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        resolve({
          url: reader.result,
          path: fileName || file.name || 'appraisal-photo.jpg',
        })
      }
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })
  },
}

export default storage
