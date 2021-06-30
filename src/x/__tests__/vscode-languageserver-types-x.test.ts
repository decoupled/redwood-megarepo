import {
  DiagnosticSeverity, Range
} from "vscode-languageserver-types"
import {
  ExtendedDiagnostic,
  ExtendedDiagnostic_format
} from "../vscode-languageserver-types"



describe("ExtendedDiagnostic_format", () => {
  it("can format diagnostics", async () => {
    const d: ExtendedDiagnostic = {
      uri: "file:///path/to/app/b.ts",
      diagnostic: {
        range: Range.create(1, 2, 1, 6),
        severity: DiagnosticSeverity.Error,
        message: "this is a message",
      },
    }
    const str = ExtendedDiagnostic_format(d, { cwd: "/path/to/app/" })
    expect(str).toEqual("b.ts:2:3: error: this is a message")

    const str2 = ExtendedDiagnostic_format(d)
    expect(str2).toEqual("/path/to/app/b.ts:2:3: error: this is a message")

    const str3 = ExtendedDiagnostic_format(d, {
      getSeverityLabel: (s) => `<${s}>`,
    })
    expect(str3).toEqual("/path/to/app/b.ts:2:3: <1>: this is a message")
  })
})
