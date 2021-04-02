import vscode from "vscode"
import {
  CloseAction,
  ErrorAction,
  ErrorHandler,
  LanguageClientOptions,
} from "vscode-languageclient/node"
import { lsp_client_middleware } from "./lsp_client_middleware"

export function LanguageClientOptions_build(
  ctx: vscode.ExtensionContext
): LanguageClientOptions {
  const tsLanguageIDs = [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "json",
  ]
  const tsLanguageselectors = tsLanguageIDs.map((language) => ({
    scheme: "file",
    language,
  }))
  const documentSelector = [
    ...tsLanguageselectors,
    { scheme: "file", language: "toml", pattern: "redwood.toml" },
    { scheme: "file", language: "prisma", pattern: "*.prisma" },
  ]
  // TODO: errors?
  const _errorHandler: ErrorHandler = {
    error(error, message, count) {
      console.log("lsp client connection error", error, message, count)
      return ErrorAction.Shutdown
    },
    closed() {
      return CloseAction.Restart
    },
  }
  return {
    documentSelector,
    diagnosticCollectionName: "Redwood",
    middleware: lsp_client_middleware(ctx),
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher(
        "**/.{ts,tsx,js,jsx,toml,json,prisma}"
      ),
    },
  }
}
