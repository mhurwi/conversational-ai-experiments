import { useState } from 'react'

import {
  Form,
  FormError,
  TextAreaField,
  Submit,
  useForm,
} from '@redwoodjs/forms'
import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'

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
  const [response, setResponse] = useState('...')

  const [create, { loading, error }] = useMutation(CREATE_RESPONSE, {
    onCompleted: ({ createResponse }) => {
      toast.success('Thank you for your submission!')
      setResponse(createResponse.message)
      formMethods.reset()
    },
  })

  const onSubmit = ({ prompt }) => {
    console.log(prompt)
    create({ variables: { input: { prompt } } })
  }
  return (
    <>
      <Toaster />

      <Form onSubmit={onSubmit} error={error} formMethods={formMethods}>
        <FormError error={error} wrapperClassName="form-error" />

        <label htmlFor="prompt">Prompt</label>
        <TextAreaField name="prompt" />
        <Submit disabled={loading}>Save</Submit>
      </Form>
      <p>{response}</p>
      <Link to={routes.home()}>Return home</Link>
    </>
  )
}

export default FoobarPage
