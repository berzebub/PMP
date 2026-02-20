/**
 * Pre-generate all CEFR Listening audio via ElevenLabs TTS,
 * upload to Firebase Storage, and write download URLs back
 * into src/data/listeningCEFR.js.
 *
 * - Monologues / announcements / lectures use textToSpeech
 * - Dialogues / discussions use textToDialogue (separate voices per speaker)
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk_... node scripts/generate-audio.mjs
 *
 * Prerequisites:
 *   - service-account.json at project root (Firebase Admin SDK key)
 *   - npm install (firebase-admin, @elevenlabs/elevenlabs-js)
 */

import admin from 'firebase-admin'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { pathToFileURL } from 'url'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const DELAY_MS = 2500

const VOICES = {
  narrator: '21m00Tcm4TlvDq8ikWAM',
  'Speaker A': '9BWtsMINqrJLrRacOk9x',
  'Speaker B': 'IKne3meq5aSn9XLyUdCD',
  'Speaker C': 'JBFqnCBsd6RMkjVDRZzb',
}

const DIALOGUE_TYPES = new Set(['dialogue', 'discussion'])

if (!ELEVENLABS_API_KEY) {
  console.error('ERROR: Set ELEVENLABS_API_KEY environment variable.')
  process.exit(1)
}

const serviceAccountPath = resolve(__dirname, 'service-account.json')
let serviceAccount
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
} catch {
  console.error('ERROR: Cannot read service-account.json at project root.')
  console.error('Download from Firebase Console > Project Settings > Service Accounts.')
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'edutask-4d90b.firebasestorage.app',
})
const bucket = admin.storage().bucket()

const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY })

const dataPath = resolve(__dirname, '..', 'src', 'data', 'listeningCEFR.js')
const { listeningScripts, LISTENING_LEVELS } = await import(pathToFileURL(dataPath).href)

const allScripts = []
for (const level of LISTENING_LEVELS) {
  for (const s of listeningScripts[level]) {
    allScripts.push({ level, ...s })
  }
}

console.log(`Found ${allScripts.length} scripts to process.\n`)

// ── helpers ──

async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

function parseDialogueInputs(scriptText) {
  const inputs = []
  const regex = /\[([^\]]+)\]\s*(.+)/g
  let match
  while ((match = regex.exec(scriptText)) !== null) {
    const speaker = match[1].trim()
    const text = match[2].trim()
    const voiceId = VOICES[speaker] || VOICES.narrator
    inputs.push({ text, voiceId })
  }
  return inputs
}

async function generateMonologue(script) {
  const audio = await elevenlabs.textToSpeech.convert(VOICES.narrator, {
    text: script.script,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: script.voiceConfig?.stability ?? 0.5,
      similarity_boost: script.voiceConfig?.similarity_boost ?? 0.75,
      style: 0,
      use_speaker_boost: true,
    },
  })
  return streamToBuffer(audio)
}

async function generateDialogue(script) {
  const inputs = parseDialogueInputs(script.script)
  if (inputs.length === 0) {
    console.log('    (no speaker labels found, falling back to monologue)')
    return generateMonologue(script)
  }
  const audio = await elevenlabs.textToDialogue.convert({ inputs })
  return streamToBuffer(audio)
}

// ── main loop ──

let sourceCode = readFileSync(dataPath, 'utf8')
const results = { generated: 0, skipped: 0, failed: 0 }

for (let i = 0; i < allScripts.length; i++) {
  const s = allScripts[i]
  const tag = `[${i + 1}/${allScripts.length}]`
  const isDialogue = DIALOGUE_TYPES.has(s.type)

  const idPattern = `id: '${s.id}',`
  const idPos = sourceCode.indexOf(idPattern)
  if (idPos === -1) {
    console.log(`${tag} SKIP ${s.id} -- not found in source`)
    results.skipped++
    continue
  }

  const nextMaxReplays = sourceCode.indexOf('maxReplays:', idPos)
  const segment = sourceCode.substring(idPos, nextMaxReplays)
  if (segment.includes('audioUrl:')) {
    console.log(`${tag} SKIP ${s.id} -- audioUrl already exists`)
    results.skipped++
    continue
  }

  const storagePath = `cefr-audio/${s.id}.mp3`
  const file = bucket.file(storagePath)

  let downloadUrl

  try {
    const [exists] = await file.exists()
    if (exists) {
      console.log(`${tag} ${s.id} -- already in Storage, reusing`)
      await file.makePublic()
      downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`
    } else {
      const mode = isDialogue ? 'dialogue' : 'monologue'
      console.log(`${tag} Generating ${s.id} (${s.level}, ${mode}, ${s.wordCount}w)...`)

      const buffer = isDialogue ? await generateDialogue(s) : await generateMonologue(s)
      console.log(`    Audio: ${(buffer.length / 1024).toFixed(1)} KB`)

      await file.save(buffer, {
        contentType: 'audio/mpeg',
        metadata: { cacheControl: 'public, max-age=31536000' },
      })
      await file.makePublic()
      downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

      if (i < allScripts.length - 1) {
        await new Promise((r) => setTimeout(r, DELAY_MS))
      }
    }

    console.log(`    URL: ${downloadUrl}`)

    const lineStart = sourceCode.lastIndexOf('\n', nextMaxReplays)
    sourceCode =
      sourceCode.slice(0, lineStart + 1) +
      `    audioUrl: '${downloadUrl}',\n` +
      sourceCode.slice(lineStart + 1)

    results.generated++
  } catch (err) {
    console.error(`    FAILED: ${err.message}`)
    results.failed++
  }
}

writeFileSync(dataPath, sourceCode, 'utf8')

console.log('\n=== Summary ===')
console.log(`Generated / reused: ${results.generated}`)
console.log(`Skipped (existing): ${results.skipped}`)
console.log(`Failed:             ${results.failed}`)

process.exit(results.failed > 0 ? 1 : 0)
