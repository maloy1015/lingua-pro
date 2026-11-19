import TextToSpeech from '@google-cloud/text-to-speech'
import { VOICES } from '../catalog.mjs'

const client = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCLOUD_PROJECT ? new TextToSpeech.TextToSpeechClient() : null

const ELEVEN = {
  'en-female': process.env.ELEVENLABS_VOICE_EN_FEMALE || '21m00Tcm4TlvDq8ikWAM',
  'en-male': process.env.ELEVENLABS_VOICE_EN_MALE || 'ErXwobaYiN019PkySvjV',
  'uz-female': process.env.ELEVENLABS_VOICE_UZ_FEMALE || '',
  'uz-male': process.env.ELEVENLABS_VOICE_UZ_MALE || '',
}

const escapeXml = (s) => String(s || '').replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]))

export async function synthesise({ script, voiceId, language = 'en-US', provider = process.env.TTS_PROVIDER || 'google' }) {
  const option = VOICES.find((v) => v.id === voiceId) || VOICES[0]
  if (provider === 'elevenlabs') {
    const key = process.env.ELEVENLABS_API_KEY
    const voice = ELEVEN[voiceId] || ELEVEN['en-female']
    if (!key || !voice) throw new Error('ElevenLabs TTS kalitlari sozlanmagan (ELEVENLABS_API_KEY / voice ID).')
    const text = script.map((s) => s.text).join('\n')
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    })
    if (!res.ok) throw new Error(`ElevenLabs xato: ${res.status} ${await res.text()}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    return { audio: buffer, timepoints: [], contentType: 'audio/mpeg' }
  }

  if (!client) throw new Error('Google Cloud TTS clienti ishga tushmadi (ADC topilmadi).')
  const marks = script.map((s, i) => `<mark name="s${i}"/>${escapeXml(s.text)}`).join(' ')
  const ssml = `<speak><voice language="${option.locale}" gender="${option.gender}">${marks}</voice></speak>`
  let names = {}
  try { names = JSON.parse(process.env.GOOGLE_TTS_VOICE_NAMES || '{}') } catch { names = {} }
  const [response] = await client.synthesizeSpeech({
    input: { ssml },
    voice: { languageCode: option.locale, name: names[voiceId] || undefined, ssmlGender: option.gender },
    audioConfig: { audioEncoding: 'MP3', speakingRate: 1, pitch: 0 },
    enableTimepointing: ['SSML_MARK'],
  })
  return {
    audio: Buffer.from(response.audioContent),
    timepoints: (response.timepoints || []).map((tp) => ({ name: tp.markName, seconds: Number(tp.timeSeconds || 0) })).sort((a, b) => a.seconds - b.seconds),
    contentType: 'audio/mpeg',
  }
}
