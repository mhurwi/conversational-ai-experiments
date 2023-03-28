import { useState } from 'react'

import {
  Form,
  FormError,
  TextAreaField,
  Submit,
  useForm,
} from '@redwoodjs/forms'
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

const FoobarPage = () => {
  const formMethods = useForm()
  const [messages, setMessages] = useState([])

  const [create, { loading, error }] = useMutation(CREATE_RESPONSE, {
    onCompleted: ({ createResponse }) => {
      // TODO: change messages to show all the messages along with the new message
      setMessages([
        ...messages,
        { role: 'assistant', content: createResponse.message },
      ])
    },
  })

  const onSubmit = ({ prompt }) => {
    console.log(prompt)
    const newMessages = [...messages, { role: 'user', content: prompt }]
    setMessages(newMessages)
    formMethods.reset()
    create({ variables: { input: { messages: newMessages } } })
  }
  // Use tailwind css to make a simple box with a single textarea and submit button
  return (
    <>
      <div>
        <div className="mx-auto mb-6 w-96 rounded-lg bg-white p-6 shadow">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`my-2 ${message.role === 'user' ? 'text-right' : ''}`}
            >
              <span
                className={`inline-block rounded-lg py-2 px-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-800'
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: message.content }} />
              </span>
            </div>
          ))}

          <div className="my-2">
            <Form onSubmit={onSubmit} error={error} formMethods={formMethods}>
              <FormError error={error} wrapperClassName="form-error" />

              <label htmlFor="prompt" className="mb-2 block font-medium">
                Prompt
              </label>
              <TextAreaField
                name="prompt"
                className="mb-4 w-full rounded-md border border-gray-300 p-2"
              />
              <Submit
                disabled={loading}
                className="mb-4 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600"
              >
                Save
              </Submit>
            </Form>
          </div>
        </div>
      </div>
    </>
  )
}

export default FoobarPage
