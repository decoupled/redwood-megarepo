import { lazy } from "@decoupled/xlib"
import { buildSchema, GraphQLSchema } from "graphql"
import { mergeTypes } from "merge-graphql-schemas"
import { graphql_redwood_root_schema__parsed } from "src/x/graphql/graphql_redwood_root_schema"
import { BaseNode } from "../ide"
import { RWProject } from "./RWProject"

export class RWGraphQLHelper extends BaseNode {
  constructor(public parent: RWProject) {
    super()
  }
  @lazy() get id() {
    // this is an internal node. it is not associated to any particular file
    return this.parent.id + " graphqlHelper"
  }

  bailOutOnCollection() {
    // we need this node to participate in all collection requests
    // because it will emit info and diagnostics for files all over the codebase
    return false
  }
  get mergedSchemaString(): string | undefined {
    try {
      const docs = [
        graphql_redwood_root_schema__parsed(),
        ...this.parent.sdls.map((_) => _.schemaTag?.graphqlAST),
      ].filter((_) => typeof _ !== "undefined")
      const typeDefs = mergeTypes(docs, { all: true })
      return typeDefs
    } catch (e) {
      return undefined
    }
  }
  get mergedSchema(): GraphQLSchema | undefined {
    if (!this.mergedSchemaString) return undefined
    return buildSchema(this.mergedSchemaString)
  }
}
