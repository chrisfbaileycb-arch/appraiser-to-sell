/**
 * Download helper for files and reports
 */

export const download = {
  async saveFile(file, fileName = 'heirloom-appraisal-report.html') {
    let url = ''
    let shouldRevoke = false

    if (typeof file === 'string') {
      url = file
    } else if (file instanceof Blob) {
      url = URL.createObjectURL(file)
      shouldRevoke = true
    } else if (file && file.url) {
      url = file.url
    }

    if (!url) {
      throw new Error('No valid file to download')
    }

    const a = document.createElement('a')
    a.href = url
    // Normalize .pdf extension to .html if it's an HTML blob so browser/viewer opens correctly
    const actualName = (file instanceof Blob && file.type.includes('html'))
      ? fileName.replace(/\.pdf$/i, '.html')
      : fileName

    a.download = actualName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    return true
  },
}

export default download
