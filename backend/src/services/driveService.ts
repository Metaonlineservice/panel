import { driveApi } from '../google/client.js'
import { config } from '../config.js'

export async function uploadDocument(fileBuffer: Buffer, name: string, mimeType: string): Promise<{ fileId: string; url: string }> {
  const folderId = config.google.driveFolderId
  const res = await driveApi.files.create({
    requestBody: { name, parents: folderId ? [folderId] : undefined },
    media: { mimeType, body: fileBuffer },
    fields: 'id, webViewLink',
  })
  const fileId = res.data.id ?? ''
  const url = res.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`
  return { fileId, url }
}

export async function makeFilePublic(fileId: string): Promise<void> {
  try {
    await driveApi.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    })
  } catch (err) {
    // Best-effort; not all folders allow public sharing.
  }
}

export async function uploadDocumentPublic(fileBuffer: Buffer, name: string, mimeType: string): Promise<{ fileId: string; url: string }> {
  const { fileId, url } = await uploadDocument(fileBuffer, name, mimeType)
  await makeFilePublic(fileId)
  return { fileId, url }
}
