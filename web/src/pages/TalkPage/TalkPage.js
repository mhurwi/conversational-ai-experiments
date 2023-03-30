import { useState } from 'react'

import { Deepgram } from '@deepgram/sdk/browser'

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
  const [isRecording, setIsRecording] = useState(false)
  const [recorder, setRecorder] = useState(null)
  const [words, setWords] = useState([])
  const [messages, setMessages] = useState([])

  const [create, { loading, error }] = useMutation(CREATE_RESPONSE, {
    onCompleted: ({ createResponse }) => {
      // TODO: change messages to show all the messages along with the new message
      setMessages([
        ...messages,
        { role: 'assistant', content: createResponse.message },
      ])

      var msg = new SpeechSynthesisUtterance()
      msg.text = createResponse.message
      window.speechSynthesis.speak(msg)
    },
  })

  function record() {
    const deepgram = new Deepgram('ec3d9b197a47778868a24967ba64405993f7a847')

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setIsRecording(true)

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })
      setRecorder(mediaRecorder)

      const deepgramSocket = deepgram.transcription.live({
        punctuate: true,
      })

      deepgramSocket.addEventListener('open', () => {
        mediaRecorder.addEventListener('dataavailable', async (event) => {
          if (event.data.size > 0 && deepgramSocket.readyState == 1) {
            deepgramSocket.send(event.data)
          }
        })
        mediaRecorder.start(1000)
      })

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
  }

  function stop() {
    recorder && recorder.stop()

    if (words.length === 0) {
      return
    }

    const newMessages = [
      ...messages,
      { role: 'user', content: words.join(' ') },
    ]

    setMessages(newMessages)
    setWords([])

    console.log(newMessages)

    create({ variables: { input: { messages: newMessages } } })

    setIsRecording(false)
    setRecorder(null)
  }

  function RecordButton() {
    const handleMouseDown = () => {
      record()
    }

    const handleMouseUp = () => {
      stop()
    }

    const buttonClasses = isRecording
      ? 'bg-red-500 border-red-700 animate-pulse'
      : 'bg-green-500 border-green-700'

    return (
      <button
        className={`
        flex h-40 w-40
        flex-col items-center justify-center
        rounded-full rounded
        border-4
        border-solid
        py-2 px-4 text-xl
        font-bold
        leading-6 text-white
        transition-all duration-300 ease-in-out ${buttonClasses}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <p>Push</p>
        <p>to</p>
        <p>Talk</p>
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

      <div className="flex-col items-center justify-center">
        <div className="mx-auto mb-6 min-h-full	 w-96 rounded-lg bg-white p-6 shadow">
          {messages.length === 0 && words.length === 0 && (
            <p className="text-center text-sm text-slate-600">
              As you talk, your words will appear here.
            </p>
          )}
          {messages.length > 0 &&
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
            ))}
          {/* Show a preview of the user's words as they speak */}
          {words.length > 0 && (
            <span className="inline-block rounded-lg bg-blue-400 py-2 px-4 text-right text-white">
              {words.join(' ')}
            </span>
          )}
          {loading && (
            <p className="text-center text-sm text-slate-600">Thinking...</p>
          )}
        </div>
        <RecordButton />
        <button onClick={clear}>Clear</button>
      </div>
    </>
  )
}

export default TalkPage
