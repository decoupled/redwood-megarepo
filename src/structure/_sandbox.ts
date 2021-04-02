const projectRoot = "/tmp/ff/example-blog"

// creating a project is easy...
{
  const project = createExampleProject()
  project.pages.length
}

// let's try out the outline
{
  const project = createExampleProject()
  const outline = getOutline(project)
  console.log(typeof outline)
  console.log(util.inspect(outline))
  const cs = await outline.children()
  console.log(cs)
  const x = await TreeItem2_resolveChildren(outline)
  console.log(x)
}

// trying to track down some bugs...

{
  const project = createExampleProject()
  const ff = `file://${projectRoot}/web/src/Routes.js`
  const node = await project.findNode(ff)
  console.log(util.inspect(node))
  const info2 = await project.collectIDEInfo(ff)
  info2
  const routes = project.router.routes
  routes.length
  console.log(routes.map((r) => [typeof r.page, r.path]))
  for (const route of project.router.routes) {
    console.log(route.sampleLocalPreviewURL)
    console.log(Array.from(route.ideInfo()))
  }
}



function createExampleProject() {
  // "/Users/aldo/code/rw-app-for-testing-new-extension/redwoodblog"
  return new RWProject({ projectRoot, host: new DefaultHost() })
}

import { ArrayLike_normalize } from "src/x/Array"
import { TreeItem2_resolveChildren } from "src/x/vscode"
import * as util from "util"
import { DefaultHost } from "./hosts"
import { RWProject } from "./model"
import { getOutline } from "./outline"
