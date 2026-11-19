import admin from 'firebase-admin'
import path from 'node:path'

export async function uploadFile(localPath, destPath, contentType) {
  const bucket = admin.storage().bucket()
  const [file] = await bucket.upload(localPath, {
    destination: destPath,
    metadata: { contentType, cacheControl: 'public,max-age=31536000' },
  })
  // try to make public; if bucket has uniform access this may fail, then use signed URL
  try {
    await file.makePublic()
    return `https://storage.googleapis.com/${bucket.name}/${encodeURI(destPath)}`
  } catch {
    const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 10 })
    return url
  }
}

export async function uploadBuffer(buffer, destPath, contentType) {
  const bucket = admin.storage().bucket()
  const file = bucket.file(destPath)
  await file.save(buffer, { contentType, resumable: false, metadata: { cacheControl: 'public,max-age=31536000' } })
  try {
    await file.makePublic()
    return `https://storage.googleapis.com/${bucket.name}/${encodeURI(destPath)}`
  } catch {
    const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 10 })
    return url
  }
}
