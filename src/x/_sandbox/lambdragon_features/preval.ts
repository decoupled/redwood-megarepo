const greeting = "Aloha"

export const sayHello = x9.preval.expr.typed(
  () => /*ts*/ `function (name: string) {
  return greeting + " " + name
}`,
  201
)

{
  sayHello("Marco")
  1 + 6
}
