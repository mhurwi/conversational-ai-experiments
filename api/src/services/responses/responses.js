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
  const { messages, topic, customPrompt } = input

  console.log('createResponse --------------------')

  const defaultPrompt = `Act as an expert in ${topic}. You are enthusiastic and want to dicuss ${topic} in a conversational tone. You only want to discuss ${topic} and you will redirect the converstaion back to ${topic} when the user goes off-topic. You might even mention that you are only here to discuss ${topic}.  Keep your responses short, conversational and limited to at most 50 words.`

  const prepend = {
    role: 'system',
    content: customPrompt || defaultPrompt,
  }

  messages.push(prepend)
  console.log('messages --------', messages)

  try {
    console.log('calling OpenAI -------')
    const completion = await openai.createChatCompletion({
      // model: 'gpt-3.5-turbo', // faster but less accurate
      model: 'gpt-4', // slower but more accurate
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
