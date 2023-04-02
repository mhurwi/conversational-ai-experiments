export const schema = gql`
  type Response {
    id: Int!
    prompt: String
    message: String
    error: String
    createdAt: DateTime!
  }

  type Query {
    responses: [Response!]! @requireAuth
    response(id: Int!): Response @requireAuth
  }

  input MessageInput {
    role: String!
    content: String!
  }
  input CreateResponseInput {
    messages: [MessageInput!]!
    topic: String
    error: String
    customPrompt: String
  }

  input UpdateResponseInput {
    message: String
    error: String
  }

  type Mutation {
    createResponse(input: CreateResponseInput!): Response! @requireAuth
    updateResponse(id: Int!, input: UpdateResponseInput!): Response!
      @requireAuth
    deleteResponse(id: Int!): Response! @requireAuth
  }
`
