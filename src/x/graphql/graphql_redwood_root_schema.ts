import { memoize } from "lodash"
import { parse } from "graphql"

export const graphql_redwood_root_schema__parsed = memoize(() => parse(graphql_redwood_root_schema))

// this was manually copied from the api package
export const graphql_redwood_root_schema = `
scalar Date
scalar Time
scalar DateTime
scalar JSON
scalar JSONObject

type Redwood {
  version: String
  currentUser: JSON
  prismaVersion: String
}

type Query {
  redwood: Redwood
}`
