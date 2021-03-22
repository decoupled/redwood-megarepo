declare module "*.png" {
  const content: string & { __image: "png" }
  export default content
}
declare module "*.gif"
declare module "*.jpg"
declare module "*.svg"
declare module "*.jpeg"

declare module "*!text" {
  const content: string
  export default content
}

// Some do it the other way around.
declare module "json!*" {
  const value: any
  export default value
}
