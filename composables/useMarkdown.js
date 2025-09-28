/**
 * Markdown Rendering Composable
 * Provides markdown to HTML conversion functionality
 */

export function useMarkdown() {
  const renderMarkdown = (content) => {
    if (!content) return ''

    let html = content

    // Code blocks (must be first to avoid interfering with other replacements)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="language-$1 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code>$2</code></pre>')

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mt-10 mb-6">$1</h1>')

    // Bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-6 shadow-sm" />')

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">$1</code>')

    // Lists (process line by line to handle properly)
    const lines = html.split('\n')
    let inList = false
    let listType = null
    const processedLines = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Unordered list
      if (line.match(/^\* (.+)$/)) {
        if (!inList || listType !== 'ul') {
          if (inList) processedLines.push(`</${listType}>`)
          processedLines.push('<ul class="list-disc pl-6 mb-4 space-y-1">')
          inList = true
          listType = 'ul'
        }
        processedLines.push(`<li class="text-gray-700 leading-relaxed">${line.replace(/^\* (.+)$/, '$1')}</li>`)
      }
      // Ordered list
      else if (line.match(/^\d+\. (.+)$/)) {
        if (!inList || listType !== 'ol') {
          if (inList) processedLines.push(`</${listType}>`)
          processedLines.push('<ol class="list-decimal pl-6 mb-4 space-y-1">')
          inList = true
          listType = 'ol'
        }
        processedLines.push(`<li class="text-gray-700 leading-relaxed">${line.replace(/^\d+\. (.+)$/, '$1')}</li>`)
      }
      // Blockquotes
      else if (line.match(/^> (.+)$/)) {
        if (inList) {
          processedLines.push(`</${listType}>`)
          inList = false
          listType = null
        }
        processedLines.push(`<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-6 bg-blue-50 py-2">${line.replace(/^> (.+)$/, '$1')}</blockquote>`)
      }
      // Horizontal rules
      else if (line.match(/^---$/)) {
        if (inList) {
          processedLines.push(`</${listType}>`)
          inList = false
          listType = null
        }
        processedLines.push('<hr class="border-t border-gray-300 my-8" />')
      }
      // Regular lines
      else {
        if (inList && line.trim() === '') {
          processedLines.push(`</${listType}>`)
          inList = false
          listType = null
        }
        processedLines.push(line)
      }
    }

    if (inList) {
      processedLines.push(`</${listType}>`)
    }

    html = processedLines.join('\n')

    // Paragraphs and line breaks
    html = html.replace(/\n\n+/g, '</p><p class="text-gray-700 mb-6 leading-relaxed">')
    html = html.replace(/\n/g, '<br>')
    html = '<p class="text-gray-700 mb-6 leading-relaxed">' + html + '</p>'

    // Clean up empty paragraphs
    html = html.replace(/<p class="text-gray-700 mb-6 leading-relaxed"><\/p>/g, '')

    // Clean up paragraphs that only contain HTML tags
    html = html.replace(/<p class="text-gray-700 mb-6 leading-relaxed">(\s*<[^>]+>\s*)<\/p>/g, '$1')

    return html
  }

  return {
    renderMarkdown
  }
}