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
    recorder.stop()

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

  // TODO: send words to ChatGPT, then get response from ChatGPT and use text to speech
  // so it feels like you are talking to a bot and listening to its response>

  return (
    <>
      <MetaTags title="Talk" description="Talk page" />

      <h1>TalkPage</h1>
      <div className="mx-auto mb-6 min-h-full	 w-96 rounded-lg bg-white p-6 shadow">
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
      </div>
      {isRecording ? (
        <button onClick={stop}>Stop</button>
      ) : (
        <button onClick={record}>Record</button>
      )}
      {loading && <div>Thinking...</div>}
    </>
  )
}

export default TalkPage
