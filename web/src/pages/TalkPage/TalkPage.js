import { useState, useMemo } from 'react'

import { Deepgram } from '@deepgram/sdk/browser'
import axios from 'axios'

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
  const [topic, setTopic] = useState('history')
  const [customPrompt, setCustomPrompt] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)

  // Convert the response to a SpeechSynthesisUtterance
  // function speakResponse(text) {
  //   var msg = new SpeechSynthesisUtterance()
  //   msg.text = text
  //   window.speechSynthesis.speak(msg)
  // }

  async function speakResponseUsingApi(text) {
    const apiKey = process.env.GOOGLE_API_KEY
    const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`

    const voiceName = 'en-GB-News-J'

    const ssml = `<speak>${text}</speak>`

    const requestBody = {
      input: {
        ssml: ssml,
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
      // Set isPlaying to true when the audio starts playing
      audio.addEventListener('play', () => {
        setIsPlaying(true)
      })

      // Set isPlaying to false when the audio ends
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
      })

      // Handle any errors that occur during playback
      audio.addEventListener('error', () => {
        setIsPlaying(false)
      })

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
    create({
      variables: { input: { messages: newMessages, topic, customPrompt } },
    })
    setRecorder(null)
  }

  function clear() {
    setWords([])
    setMessages([])
    setRecorder(null)
    setIsRecording(false)
  }

  // A dropdown menu to choose a topic
  const ChooseConversation = useMemo(() => {
    return (
      <div className="flex items-center justify-center space-x-4">
        <p className="text-xl font-semibold text-secondary">Topic</p>
        <div className="relative">
          <input
            type="text"
            className="focus:ring-accent block w-full appearance-none rounded border border-secondary bg-white px-4 py-2 leading-tight shadow transition-all duration-200 ease-in-out hover:border-primary focus:outline-none focus:ring-2"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic"
          />
        </div>
      </div>
    )
  }, [topic])

  const AddCustomPrompt = useMemo(() => {
    return (
      <div className="flex flex-row items-center space-y-4">
        <p className="text-xl font-semibold text-secondary">Custom prompt</p>
        <textarea
          className="h-32 w-full resize-none rounded-md border-2 border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Type your custom prompt here..."
        />
      </div>
    )
  })

  const MessagesPlaceholder = () => {
    return (
      !isRecording &&
      messages.length === 0 &&
      words.length === 0 && (
        <p className="text-center text-sm text-gray-500">
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
            className={`inline-block rounded-xl py-2 px-4 ${
              m.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-secondary text-white'
            }`}
          >
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: m.content }}
            />
          </span>
        </div>
      ))
    )
  }

  // Show a preview of the user's words as they speak
  const WordsBeingSpoken = () => {
    return (
      words.length > 0 && (
        <span className="inline-block rounded-lg bg-accent py-2 px-4 text-right text-white">
          {words.join(' ')}
        </span>
      )
    )
  }

  const WaitingForResponseIndicator = () => {
    return (
      loading && (
        <p className="text-center text-sm text-gray-500">Thinking...</p>
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
        flex h-16 w-48
        flex-col items-center justify-center
        rounded
        border-2
        border-solid
        border-green-500 bg-green-400
        py-2
        px-4
        text-lg font-semibold
        leading-6 text-white shadow-md transition-all duration-300
        ease-in-out
        hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-200
        ${loading || isPlaying ? 'cursor-not-allowed opacity-50' : ''}
        `}
        onClick={toggleRecording}
        disabled={loading || isPlaying}
      >
        <p>Push to Talk</p>
      </button>
    )

    const StopRecordingBtn = (
      <button
        className={`
        flex
        h-16
        w-48
        animate-pulse
        flex-col
        items-center
        justify-center
        rounded
        border-2
        border-solid border-red-500 bg-red-400
        py-2
        px-4 text-lg
        font-semibold leading-6 text-white shadow-md transition-all duration-300
        ease-in-out
        hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-red-200`}
        onClick={toggleRecording}
      >
        <p>Get Response</p>
      </button>
    )

    return isRecording ? StopRecordingBtn : StartRecordingBtn
  }

  const ClearButton = () => {
    return (
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={clear}
          className="hover:bg-secondary-dark focus:ring-primary rounded border border-secondary bg-secondary px-4 py-2 text-sm font-semibold text-white transition-all duration-200 ease-in-out focus:outline-none focus:ring-2"
        >
          Clear
        </button>
      </div>
    )
  }

  return (
    <>
      <MetaTags title="Talk" description="Talk page" />
      <div className="flex min-h-screen flex-col items-center justify-start">
        <div className="mt-8 flex flex-col items-center justify-center">
          {ChooseConversation}
          {AddCustomPrompt}
        </div>
        <div className="mt-6 mb-6 w-96 rounded-xl bg-white p-6 shadow-fun">
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
