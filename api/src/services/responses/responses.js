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
  const { prompt } = input
  console.log('createResponse --------------------')

  console.log(prompt)
  const completion = await openai.createCompletion({
    prompt,
    model: 'text-davinci-003',
    temperature: 0.6,
  })

  console.log(completion.data)

  const message = completion.data.choices[0].text

  console.log(message) //

  return db.response.create({
    data: { message, prompt },
  })
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
