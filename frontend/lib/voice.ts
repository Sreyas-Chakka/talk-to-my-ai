export const startSpeechRecognition = (onResult: (text: string) => void, onError?: (error: string) => void) => {
  const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
  
  if (!SpeechRecognition) {
    console.error('Speech Recognition API not supported in this browser')
    onError?.('Speech Recognition not supported')
    return null
  }

  const recognition = new SpeechRecognition()
  
  recognition.continuous = false
  recognition.interimResults = true
  recognition.lang = 'en-US'

  recognition.onstart = () => {
    console.log('Speech recognition started')
  }

  recognition.onresult = (event: any) => {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript

      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' '
      } else {
        interimTranscript += transcript
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript.trim())
    }
  }

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error)
    onError?.(event.error)
  }

  recognition.onend = () => {
    console.log('Speech recognition ended')
  }

  recognition.start()
  return recognition
}

export const stopSpeechRecognition = (recognition: any) => {
  if (recognition) {
    recognition.stop()
  }
}

export const speakText = (text: string, onEnd?: () => void) => {
  const synth = window.speechSynthesis
  
  if (!synth) {
    console.error('Text-to-Speech API not supported')
    return null
  }

  // Cancel any ongoing speech
  synth.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  
  utterance.rate = 1.0
  utterance.pitch = 1.0
  utterance.volume = 1.0
  utterance.lang = 'en-US'

  utterance.onend = () => {
    onEnd?.()
  }

  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event.error)
  }

  synth.speak(utterance)
  return utterance
}

export const stopSpeech = () => {
  const synth = window.speechSynthesis
  if (synth) {
    synth.cancel()
  }
}

export const isSpeaking = () => {
  const synth = window.speechSynthesis
  return synth ? synth.speaking : false
}
