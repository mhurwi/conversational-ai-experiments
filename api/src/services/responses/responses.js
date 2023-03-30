import { db } from 'src/lib/db'

const { Configuration, OpenAIApi } = require('openai')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_SECRET_KEY,
})
const openai = new OpenAIApi(configuration)

export const responses = () => {
  return db.response.findMany()
}

export const response = ({ id }) => {
  return db.response.findUnique({
    where: { id },
  })
}

export const createResponse = async ({ input }) => {
  console.log('input --------', input)
  const { messages } = input

  console.log('createResponse --------------------')

  // TODO: optimize how and why to use a system message
  const prepend = {
    role: 'system',
    content:
      'You are having a pleasant chat. Keep your responses short and conversational.',
  }

  messages.push(prepend)
  console.log('messages --------', messages)

  try {
    console.log('calling OpenAI -------')
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
    })
    console.log('completion --------')
    console.log(completion.data)

    const raw = completion.data.choices[0].message.content
    const message = raw.replace(/\n/g, '<br>')

    console.log(message) //

    return db.response.create({
      data: { message, prompt: '' },
    })
  } catch (error) {
    console.log(error)
  }
}

export const updateResponse = ({ id, input }) => {
  return db.response.update({
    data: input,
    where: { id },
  })
}

export const deleteResponse = ({ id }) => {
  return db.response.delete({
    where: { id },
  })
}
