import React from "react"
import { gql, useSubscription, useQuery } from "@apollo/client"

const QUERY = gql`
  query all {
    messages {
      id
      content
      author
    }
  }
`

const SUB = gql`
  subscription SubToNewMessage {
    messageAdded {
      id
      content
    }
  }
`

export default function Messages() {
  const res = useSubscription(SUB, {})
  console.log("\n\n", res, "\n\n")
  return (
    <div>
      <h1>Messages here</h1>
      <AllMessage />
    </div>
  )
}

function AllMessage() {
  const { loading, data, subscribeToMore } = useQuery(QUERY)
  React.useEffect(() => {
    if (!loading) {
      subscribeToMore({
        document: SUB,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev
          const message = subscriptionData.data.messageAdded
          const cp = {
            ...prev,
            messages: [...prev.messages, message]
          }
          return cp
        }
      })
    }
  }, [loading, subscribeToMore])
  if (loading) return <div>loading...</div>
  console.log(data)
  return (
    <div>
      {data.messages.map(({ id, content }) => {
        return <div key={id}>{content}</div>
      })}
    </div>
  )
}
