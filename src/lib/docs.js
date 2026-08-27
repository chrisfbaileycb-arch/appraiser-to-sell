/**
 * Document generation service for Heirloom reports
 */

export const docs = {
  async pdf(config) {
    const { title = 'Heirloom Appraisal Report', header, footer, pages = [] } = config

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: letter;
      margin: 20mm 18mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1c1917;
      background: #ffffff;
      line-height: 1.6;
      margin: 0;
      padding: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1.5px solid #e7e5e4;
      padding-bottom: 10px;
      margin-bottom: 24px;
      font-size: 13px;
      font-weight: 600;
      color: #78716c;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .cover-title {
      font-size: 28px;
      font-weight: 700;
      color: #78350f;
      margin: 0 0 6px 0;
      font-family: Georgia, serif;
    }
    .cover-subtitle {
      font-size: 16px;
      color: #b45309;
      font-weight: 600;
      margin-bottom: 18px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      background: #fdfaf6;
      border: 1px solid #fef3c7;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .meta-item .meta-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #92400e;
      font-weight: 600;
    }
    .meta-item .meta-value {
      font-size: 15px;
      font-weight: 600;
      color: #1c1917;
      margin-top: 2px;
    }
    .img-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 20px 0;
    }
    .img-box {
      border: 1px solid #e7e5e4;
      border-radius: 8px;
      overflow: hidden;
      max-height: 240px;
      background: #f5f5f4;
    }
    .img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    h2 {
      font-size: 18px;
      font-weight: 700;
      color: #78350f;
      border-bottom: 1px solid #fed7aa;
      padding-bottom: 6px;
      margin: 24px 0 12px 0;
      font-family: Georgia, serif;
    }
    p {
      font-size: 14px;
      color: #44403c;
      margin: 0 0 12px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 20px 0;
      font-size: 13.5px;
    }
    th, td {
      border: 1px solid #e7e5e4;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: #fbf9f6;
      color: #78350f;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      background: #fef3c7;
      color: #92400e;
      margin-bottom: 10px;
    }
    .callout {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 12.5px;
      color: #78350f;
      margin: 20px 0;
    }
    .list {
      padding-left: 20px;
      font-size: 13.5px;
      color: #44403c;
    }
    .list li {
      margin-bottom: 6px;
    }
    .divider {
      border-top: 1px dashed #d6d3d1;
      margin: 24px 0;
    }
  </style>
</head>
<body>
`

    if (header) {
      html += `<div class="header"><span>${escapeHtml(header.left || '')}</span><span>${escapeHtml(header.right || '')}</span></div>`
    }

    for (const page of pages) {
      for (const section of page.sections || []) {
        if (section.type === 'cover') {
          html += `<div class="cover-title">${escapeHtml(section.title)}</div>`
          if (section.subtitle) {
            html += `<div class="cover-subtitle">${escapeHtml(section.subtitle)}</div>`
          }
          if (section.meta?.length) {
            html += '<div class="meta-grid">'
            for (const m of section.meta) {
              html += `<div class="meta-item"><div class="meta-label">${escapeHtml(m.label)}</div><div class="meta-value">${escapeHtml(m.value)}</div></div>`
            }
            html += '</div>'
          }
        } else if (section.type === 'imageGrid') {
          html += '<div class="img-grid">'
          for (const img of section.images || []) {
            html += `<div class="img-box"><img src="${escapeHtml(img.url)}" alt="Appraisal Item" /></div>`
          }
          html += '</div>'
        } else if (section.type === 'heading') {
          html += `<h2>${escapeHtml(section.text)}</h2>`
        } else if (section.type === 'paragraph') {
          html += `<p>${escapeHtml(section.text)}</p>`
        } else if (section.type === 'badge') {
          html += `<div class="badge">${escapeHtml(section.text)}</div>`
        } else if (section.type === 'table') {
          html += '<table><thead><tr>'
          for (const col of section.columns || []) {
            html += `<th>${escapeHtml(col.header)}</th>`
          }
          html += '</tr></thead><tbody>'
          for (const row of section.rows || []) {
            html += '<tr>'
            for (const col of section.columns || []) {
              html += `<td>${escapeHtml(row[col.key] || '')}</td>`
            }
            html += '</tr>'
          }
          html += '</tbody></table>'
        } else if (section.type === 'list') {
          html += `<${section.ordered ? 'ol' : 'ul'} class="list">`
          for (const item of section.items || []) {
            html += `<li>${escapeHtml(item)}</li>`
          }
          html += `</${section.ordered ? 'ol' : 'ul'}>`
        } else if (section.type === 'callout') {
          html += `<div class="callout">${escapeHtml(section.text)}</div>`
        } else if (section.type === 'divider') {
          html += '<div class="divider"></div>'
        }
      }
    }

    html += `</body></html>`
    return new Blob([html], { type: 'text/html;charset=utf-8' })
  },
}

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str ?? '')
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default docs
