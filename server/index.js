import express from 'express'
import cors from 'cors'
import multer from 'multer'
import sharp from 'sharp'
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb'
import { Readable } from 'stream'
import dns from 'dns'

// Fix Windows DNS SRV lookup for MongoDB Atlas cluster0.lznb0hr.mongodb.net
try {
  dns.setDefaultResultOrder('ipv4first')
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {
  console.warn('DNS server override notice:', e.message)
}

const app = express()
const PORT = process.env.PORT || 5000

// MongoDB Atlas URI
const MONGODB_URI = "mongodb+srv://lokesh8637427067_db_user:f7kNmVcaI4ksc7SC@cluster0.lznb0hr.mongodb.net/kungfu_academy_storage"

app.use(cors())
app.use(express.json({ limit: '15mb' }))

// Setup multer memory storage (limit 10MB per file)
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'
    ]
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPG, JPEG, PNG, WEBP, and PDF files are allowed.'))
    }
  }
})

let db
let bucket

// Connect to MongoDB Atlas GridFS
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    })
    await client.connect()
    db = client.db('kungfu_academy_storage')
    bucket = new GridFSBucket(db, { bucketName: 'uploads' })
    console.log('✔ Connected successfully to MongoDB Atlas GridFS Bucket (uploads)')
  } catch (err) {
    console.error('✖ MongoDB Connection Error:', err.message)
  }
}

connectDB()

// Category Target Size & Compression Presets
const PRESETS = {
  profile: { maxWidth: 500, maxHeight: 500, maxSizeBytes: 300 * 1024, initialQuality: 80 },
  certificate: { maxWidth: 1600, maxHeight: 1600, maxSizeBytes: 800 * 1024, initialQuality: 85 },
  medal: { maxWidth: 800, maxHeight: 800, maxSizeBytes: 500 * 1024, initialQuality: 80 },
  gallery: { maxWidth: 1400, maxHeight: 1400, maxSizeBytes: 700 * 1024, initialQuality: 82 },
  tournament: { maxWidth: 1920, maxHeight: 1080, maxSizeBytes: 1000 * 1024, initialQuality: 85 },
  logo: { maxWidth: 800, maxHeight: 800, maxSizeBytes: 500 * 1024, initialQuality: 85 },
  settings: { maxWidth: 800, maxHeight: 800, maxSizeBytes: 500 * 1024, initialQuality: 85 },
  default: { maxWidth: 1200, maxHeight: 1200, maxSizeBytes: 500 * 1024, initialQuality: 80 }
}

/**
 * Server-Side Image Processing with Sharp
 * Auto-orients, resizes, strips EXIF metadata, converts to WebP, and enforces max target file size.
 */
async function processAndCompressImage(buffer, category = 'default', originalMimeType = '') {
  // If PDF, return original buffer directly
  if (originalMimeType.toLowerCase() === 'application/pdf') {
    return {
      optimizedBuffer: buffer,
      contentType: 'application/pdf',
      extension: '.pdf'
    }
  }

  const preset = PRESETS[category] || PRESETS.default
  let quality = preset.initialQuality
  let optimizedBuffer

  try {
    let pipeline = sharp(buffer)
      .rotate() // Auto-orient using EXIF orientation
      .resize({
        width: preset.maxWidth,
        height: preset.maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      })

    optimizedBuffer = await pipeline
      .webp({ quality, effort: 4 })
      .toBuffer()

    // Iterative quality adjustment if compressed size exceeds category limit
    while (optimizedBuffer.length > preset.maxSizeBytes && quality > 30) {
      quality -= 10
      optimizedBuffer = await sharp(buffer)
        .rotate()
        .resize({
          width: preset.maxWidth,
          height: preset.maxHeight,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality, effort: 4 })
        .toBuffer()
    }

    console.log(`⚡ Compressed [${category}] image: ${buffer.length} bytes ➔ ${optimizedBuffer.length} bytes (WebP quality: ${quality}%)`)

    return {
      optimizedBuffer,
      contentType: 'image/webp',
      extension: '.webp'
    }
  } catch (err) {
    console.warn('Sharp compression warning (using original buffer):', err.message)
    return {
      optimizedBuffer: buffer,
      contentType: originalMimeType || 'image/jpeg',
      extension: '.jpg'
    }
  }
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', gridfs: bucket ? 'connected' : 'disconnected' })
})

// Upload File to GridFS with Sharp Compression
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: uploadErr.message || 'File upload error' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    if (!bucket) {
      return res.status(500).json({ error: 'GridFS storage bucket not connected' })
    }

    try {
      const category = req.body.category || 'general'
      
      // Process and compress image using Sharp
      const { optimizedBuffer, contentType, extension } = await processAndCompressImage(
        req.file.buffer,
        category,
        req.file.mimetype
      )

      const baseName = req.file.originalname.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_')
      const filename = `${Date.now()}_${baseName}${extension}`

      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          originalName: req.file.originalname,
          contentType,
          category,
          originalSize: req.file.size,
          compressedSize: optimizedBuffer.length,
          uploadedAt: new Date().toISOString()
        }
      })

      const bufferStream = Readable.from(optimizedBuffer)

      bufferStream.pipe(uploadStream)
        .on('error', (err) => {
          console.error('GridFS Upload Stream Error:', err)
          res.status(500).json({ error: 'Failed to stream optimized file to GridFS' })
        })
        .on('finish', () => {
          const fileId = uploadStream.id.toString()
          const fileUrl = `/api/files/${fileId}`
          console.log(`✔ Stored optimized file in GridFS: ${filename} (ID: ${fileId}, Size: ${optimizedBuffer.length} bytes)`)
          res.json({
            success: true,
            fileId,
            filename,
            fileUrl,
            originalSize: req.file.size,
            compressedSize: optimizedBuffer.length,
            contentType
          })
        })
    } catch (err) {
      console.error('Server processing error:', err)
      res.status(500).json({ error: 'Failed to process and compress file.' })
    }
  })
})

// Stream File Download from GridFS
app.get('/api/files/:id', async (req, res) => {
  if (!bucket) {
    return res.status(500).json({ error: 'GridFS storage bucket not connected' })
  }

  try {
    const fileId = new ObjectId(req.params.id)
    const files = await bucket.find({ _id: fileId }).toArray()

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    const file = files[0]
    const contentType = file.metadata?.contentType || 'application/octet-stream'

    res.set({
      'Content-Type': contentType,
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000, immutable'
    })

    const downloadStream = bucket.openDownloadStream(fileId)
    downloadStream.pipe(res)
  } catch (err) {
    console.error('File retrieval error:', err)
    res.status(404).json({ error: 'Invalid file ID or file not found' })
  }
})

// Delete File from GridFS
app.delete('/api/files/:id', async (req, res) => {
  if (!bucket) {
    return res.status(500).json({ error: 'GridFS storage bucket not connected' })
  }

  try {
    const fileId = new ObjectId(req.params.id)
    await bucket.delete(fileId)
    console.log(`✔ File deleted from GridFS (ID: ${req.params.id})`)
    res.json({ success: true, message: 'File deleted from GridFS successfully' })
  } catch (err) {
    console.error('File deletion error:', err)
    res.status(500).json({ error: 'Failed to delete file from GridFS' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Sharp-Powered MongoDB GridFS Compression Server running on http://localhost:${PORT}`)
})
