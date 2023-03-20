import {
  responses,
  response,
  createResponse,
  updateResponse,
  deleteResponse,
} from './responses'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('responses', () => {
  scenario('returns all responses', async (scenario) => {
    const result = await responses()

    expect(result.length).toEqual(Object.keys(scenario.response).length)
  })

  scenario('returns a single response', async (scenario) => {
    const result = await response({ id: scenario.response.one.id })

    expect(result).toEqual(scenario.response.one)
  })

  scenario('creates a response', async () => {
    const result = await createResponse({
      input: { message: 'String', error: 'String' },
    })

    expect(result.message).toEqual('String')
    expect(result.error).toEqual('String')
  })

  scenario('updates a response', async (scenario) => {
    const original = await response({
      id: scenario.response.one.id,
    })
    const result = await updateResponse({
      id: original.id,
      input: { message: 'String2' },
    })

    expect(result.message).toEqual('String2')
  })

  scenario('deletes a response', async (scenario) => {
    const original = await deleteResponse({
      id: scenario.response.one.id,
    })
    const result = await response({ id: original.id })

    expect(result).toEqual(null)
  })
})
