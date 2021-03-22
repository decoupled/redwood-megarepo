/**
 * where to write something
 */
export type TargetDirSpecification =
  | SpecificTargetDir
  | AutoTargetDir
  | ChooseTargetDir

/**
 * a specific folder. no questions asked
 */
export interface SpecificTargetDir {
  kind: "specific"
  dir: string
}

/**
 * let the tool choose a target dir
 */
export interface AutoTargetDir {
  kind: "auto"
  defaultRootDir: string
}

/**
 * let the user choose a target dir
 */
export interface ChooseTargetDir {
  kind: "choose"
  defaultRootDir?: string
}
