const { ApolloServer, PubSub, gql } = require("apollo-server")
const shortid = require("shortid")

const pubsub = new PubSub()

const typeDefs = gql`
  type Query {
    messages: [Message!]!
  }

  type Message {
    id: ID!
    content: String!
    data: String
    author: String
  }

  type Subscription {
    messageAdded: Message
  }

  type Mutation {
    addMessage(content: String): Message
  }
`

const messages = [
  { id: 0, content: "so cool" },
  { id: 1, content: "yeah, I guess it's aight" }
]

const MESSAGE_ADDED = "MESSAGE_ADDED"

const server = new ApolloServer({
  typeDefs,
  context: async ({ req, connection }) => {
    if (connection) {
      // check connection for metadata
      return connection.context
    } else {
      // check from req
      const token = req.headers.authorization || ""

      return { token }
    }
  },
  resolvers: {
    Query: {
      messages() {
        return messages
      }
    },
    Subscription: {
      messageAdded: {
        subscribe(...args) {
          return pubsub.asyncIterator(MESSAGE_ADDED)
        }
      }
    },
    Mutation: {
      addMessage(_, { content }) {
        const message = {
          id: messages.length,
          content: content || shortid.generate()
        }
        messages.push(message)
        pubsub.publish(MESSAGE_ADDED, { messageAdded: message })
        return message
      }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
