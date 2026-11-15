let audioContext = null
let source = null
let filters = []

const FREQUENCIES = [250, 500, 1000, 2000, 3000, 4000, 6000, 8000]
const HEARING_LOSS_PROFILE = [0, 0, 5, 10, 20, 35, 50, 60]

export function initAudio(audioElement) {
  audioContext = new AudioContext()
  source = audioContext.createMediaElementSource(audioElement)

  filters = FREQUENCIES.map(freq => {
    const filter = audioContext.createBiquadFilter()
    filter.type = 'peaking'
    filter.frequency.value = freq
    filter.gain.value = 0
    filter.Q.value = 1
    return filter
  })

  source.connect(filters[0])
  filters.forEach((filter, i) => {
    if (i < filters.length - 1) {
      filter.connect(filters[i + 1])
    }
  })
  filters[filters.length - 1].connect(audioContext.destination)
}

export function setNormal() {
  filters.forEach(filter => {
    filter.gain.value = 0
  })
}

export function setLoss() {
  filters.forEach((filter, i) => {
    filter.gain.value = -HEARING_LOSS_PROFILE[i]
  })
}

export function setCompensation() {
  filters.forEach((filter, i) => {
    filter.gain.value = HEARING_LOSS_PROFILE[i]
  })
}