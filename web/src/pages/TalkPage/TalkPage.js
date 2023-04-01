import { useState } from 'react'

import { Deepgram } from '@deepgram/sdk/browser'
import axios from 'axios'

import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'
import { useMutation } from '@redwoodjs/web'

const CREATE_RESPONSE = gql`
  mutation CreateResponseMutation($input: CreateResponseInput!) {
    createResponse(input: $input) {
      id
      prompt
      message
    }
  }
`

const TalkPage = () => {
  const deepgram = new Deepgram(process.env.DEEPGRAM_KEY)

  const [isRecording, setIsRecording] = useState(false)
  const [recorder, setRecorder] = useState(null)
  const [words, setWords] = useState([])
  const [messages, setMessages] = useState([])

  // Convert the response to a SpeechSynthesisUtterance
  function speakResponse(text) {
    var msg = new SpeechSynthesisUtterance()
    msg.text = text
    window.speechSynthesis.speak(msg)
  }

  async function speakResponseUsingApi(text) {
    const apiKey = process.env.GOOGLE_API_KEY
    const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`

    const voiceName = 'en-GB-News-J'

    const requestBody = {
      input: {
        text: text,
      },
      voice: {
        languageCode: 'en-US',
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.3,
      },
    }

    try {
      const response = await axios.post(apiUrl, requestBody)
      const audioContent = response.data.audioContent
      const audioBlob = new Blob(
        [
          new Uint8Array(
            atob(audioContent)
              .split('')
              .map((char) => char.charCodeAt(0))
          ),
        ],
        { type: 'audio/mpeg' }
      )

      const audio = new Audio(URL.createObjectURL(audioBlob))
      audio.play()
    } catch (error) {
      console.error('Error calling Google TTS API:', error)
    }
  }

  const [create, { loading }] = useMutation(CREATE_RESPONSE, {
    onCompleted: ({ createResponse }) => {
      // Add the new ChaGPT response to the list of responses so that it appears on the page
      setMessages([
        ...messages,
        { role: 'assistant', content: createResponse.message },
      ])

      speakResponseUsingApi(createResponse.message)
    },
  })

  function record() {
    setIsRecording(true)

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })
      // Store a reference to the MediaRecorder object so we can stop it later
      setRecorder(mediaRecorder)

      // Connect to the deepgram socket
      const deepgramSocket = deepgram.transcription.live({
        punctuate: true,
      })

      // Add an event listener to the deepgram socket
      deepgramSocket.addEventListener('open', () => {
        // listen for data available on the socket and send it to deepgram
        mediaRecorder.addEventListener('dataavailable', async (event) => {
          if (event.data.size > 0 && deepgramSocket.readyState == 1) {
            deepgramSocket.send(event.data)
          }
        })
        // start recording and send the data every second
        mediaRecorder.start(1000)
      })

      // listen for messages from deepgram and add them to the words array
      deepgramSocket.addEventListener('message', (message) => {
        const received = JSON.parse(message.data)
        const transcript = received.channel.alternatives[0].transcript
        if (transcript && received.is_final) {
          console.log(transcript)
          let newWords = words
          newWords.push(transcript)
          setWords(newWords.filter((w) => w !== '[object MessageEvent]', ''))
        }
      })
    })

    // TODO: rather than require the user to stop recording by pressing the stop button,
    // just wait for the user to stop talking and then get the ChatGPT response and
    // record again when the user starts talking again.
  }

  function stop() {
    recorder && recorder.stop()

    setIsRecording(false)

    if (words.length === 0) {
      return
    }

    const newMessages = [
      ...messages,
      { role: 'user', content: words.join(' ') },
    ]

    setMessages(newMessages)
    setWords([])
    create({ variables: { input: { messages: newMessages } } })
    setRecorder(null)
  }

  const MessagesPlaceholder = () => {
    return (
      !isRecording &&
      messages.length === 0 &&
      words.length === 0 && (
        <p className="text-center text-sm text-slate-600">
          As you talk, your words will appear here.
        </p>
      )
    )
  }

  const Messages = () => {
    return (
      messages.length > 0 &&
      messages.map((m, index) => (
        <div
          key={index}
          className={`my-2 ${m.role === 'user' ? 'text-right' : ''}`}
        >
          <span
            className={`inline-block rounded-lg py-2 px-4 ${
              m.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-800'
            }`}
          >
            <div dangerouslySetInnerHTML={{ __html: m.content }} />
          </span>
        </div>
      ))
    )
  }

  // Show a preview of the user's words as they speak
  const WordsBeingSpoken = () => {
    return (
      words.length > 0 && (
        <span className="inline-block rounded-lg bg-blue-400 py-2 px-4 text-right text-white">
          {words.join(' ')}
        </span>
      )
    )
  }

  const WaitingForResponseIndicator = () => {
    return (
      loading && (
        <p className="text-center text-sm text-slate-600">Thinking...</p>
      )
    )
  }

  function RecordButton() {
    const toggleRecording = () => {
      if (isRecording) {
        stop()
      } else {
        record()
      }
    }

    const StartRecordingBtn = (
      <button
        className={`
        flex h-40 w-40
        flex-col items-center justify-center
        rounded-full rounded
        border-4
        border-solid
        border-green-700 bg-green-500 py-2
        px-4
        text-xl font-bold
        leading-6 text-white transition-all duration-300 ease-in-out`}
        onClick={toggleRecording}
      >
        <p>Push</p>
        <p>to</p>
        <p>Talk</p>
      </button>
    )

    const StopRecordingBtn = (
      <button
        className={`
      flex
      h-40
      w-40
      animate-pulse
      flex-col
      items-center
      justify-center
      rounded-full
      rounded
      border-4
      border-solid border-red-700 bg-red-500
      py-2
      px-4 text-xl
      font-bold leading-6 text-white transition-all duration-300 ease-in-out`}
        onClick={toggleRecording}
      >
        <p>Stop</p>
      </button>
    )

    return isRecording ? StopRecordingBtn : StartRecordingBtn
  }

  const ClearButton = () => {
    return (
      <button onClick={clear} className="text-slate-600">
        Clear
      </button>
    )
  }

  function clear() {
    setWords([])
    setMessages([])
    setRecorder(null)
    setIsRecording(false)
  }

  return (
    <>
      <MetaTags title="Talk" description="Talk page" />
      <div className="flex min-h-screen flex-col items-center justify-start">
        <div className="mb-6 w-96 rounded-lg bg-white p-6 shadow">
          <MessagesPlaceholder />
          <Messages />
          <WordsBeingSpoken />
          <WaitingForResponseIndicator />
        </div>
        <div className="w-400 border-width-1 flex flex-row space-x-4">
          <RecordButton />
          <ClearButton />
        </div>
      </div>
    </>
  )
}

export default TalkPage
