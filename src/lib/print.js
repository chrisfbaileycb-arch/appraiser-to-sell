/**
 * Print utility for Heirloom
 */
export const paperSizePx = () => ({ width: 816, height: 1056 })
export const fitPaperPx = () => ({ width: 816, height: 1056 })
export const buildSheetHtml = (content) => `<div>${content}</div>`
export const print = () => {
  if (typeof window !== 'undefined') {
    window.print()
  }
}

export default { paperSizePx, fitPaperPx, buildSheetHtml, print }
