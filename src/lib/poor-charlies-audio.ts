import audioManifest from '../../content/poor-charlies-almanack-audio.json'

export interface AlmanackAudioTrack {
  id: string
  sectionSlug: string
  titleZh: string
  title: string
  sourceUrl: string
  localPath: string | null
  status?: string
}

export const almanackAudioTracks = audioManifest as AlmanackAudioTrack[]

export function getAlmanackAudioTracks(sectionSlug?: string) {
  return almanackAudioTracks.filter(track => (
    track.localPath && (!sectionSlug || track.sectionSlug === sectionSlug)
  ))
}
