const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const isValidFileType = mimetype => allowedMimeTypes.includes(mimetype)

module.exports = { allowedMimeTypes, isValidFileType }
