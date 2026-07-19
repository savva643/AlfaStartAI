export function renderMarkdown(text: string): string {
  let html = text

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">$1</code>')

  // Tables
  html = html.replace(/\n(\|.+\|)\n(\|[-| :]+\|)\n((\|.+\|\n?)+)/g, (_match, header, _sep, body) => {
    const headers = header.split('|').filter((c: string) => c.trim()).map((c: string) =>
      `<th class="border border-border px-3 py-2 text-left font-medium bg-muted">${c.trim()}</th>`
    ).join('')
    const rows = body.trim().split('\n').map((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) =>
        `<td class="border border-border px-3 py-2">${c.trim()}</td>`
      ).join('')
      return `<tr>${cells}</tr>`
    }).join('')
    return `\n<table class="w-full border-collapse my-3 text-sm"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>\n`
  })

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="my-2 space-y-1">$1</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-4 border-border" />')

  // Line breaks (but not inside tags)
  html = html.replace(/\n\n/g, '</p><p class="mb-2">')
  html = html.replace(/\n/g, '<br/>')

  // Wrap in paragraph
  html = `<p class="mb-2">${html}</p>`

  return html
}
