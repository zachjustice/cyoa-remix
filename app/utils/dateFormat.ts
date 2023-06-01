export function formatPublishDate(dateString: string) {
    const d = new Date(dateString)
    const day = d.toLocaleDateString("en-US", {day: 'numeric'})
    const month = d.toLocaleDateString("en-US", {month: 'short'})

    const publishedYear = d.toLocaleDateString('en-US', {year: 'numeric'})
    const currentYear = new Date().toLocaleDateString('en-US', {year: 'numeric'})

    if (publishedYear === currentYear) {
        return `${month} ${day}`
    } else {
        return `${month} ${day}, ${publishedYear}`
    }
}