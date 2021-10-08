import { web, python, SampleDir, SampleFile, Project } from 'projen'
// import { TSCONFIG } from "./templates"

interface ProjectConfig {
    name: string;
    author: {
      name: string;
      email: string
    }
    version: string;
}

// Creates a new Penn labs project, with a frontend & backend subproject
export function CreatePennLabsProject (config: ProjectConfig) {
  const project = new Project({
      name: config.name,      
  });
  const frontend = CreateFrontendSubProject(config, project)
  frontend.synth();

  /* TODO: this currently breaks
    const backend = CreateBackendSubProject(config, project)
    backend.synth();
  */

  return project
}

// TODO: backend generation currently breaks
export function CreateBackendSubProject (config: ProjectConfig, parent) {
  const project = new python.PythonProject({
      name: `${config.name}-backend`,
      // logging: where are we logging lmao
      
      outdir: "backend",
      pip: false,
      parent,
      github: false,
      moduleName: `${config.name}`, 
      authorName: `${config.author.name}`, 
      authorEmail: `${config.author.email}`, 
      version: `${config.version}`,
      deps: [],
    });
  
  // Add subfolder structure
  // TODO: add settings & templates folder?
  const scripts = new SampleDir(project, "scripts", {files: {"__init__.py": "# TODO"}})
  scripts.synthesize()

  const tests = new SampleDir(project, "tests", {files: {"__init__.py": "# TODO"}})
  tests.synthesize()

  return project
}

export function CreateFrontendSubProject (config: ProjectConfig, parent) {
    const project = new web.NextJsTypeScriptProject({
        name: `${config.name}-frontend`,
        defaultReleaseBranch: 'main',
        outdir: "frontend",
  
        parent,
        github: false,
        licensed: false,
        npmignoreEnabled: false,
        tailwind: false,
        release: false,
  
        eslint: true,
        
        // TODO
        // eslintOptions: TODO
        // tsconfig: TSCONFIG,
        
        // NOTE: if we want to specify specific versions of dependency, use Dependency object to manage this: https://github.com/projen/projen/blob/main/API.md#adddependencyspec-type-metadata-
        deps: [],  
        
        // tailwind: true,          /* Setup Tailwind CSS as a PostCSS plugin. */
      });
    
    // Add subfolder structure
    const components = new SampleDir(project, "components", {files: {"Example.tsx": 
    `export default function Example() {return (<></>);}`}})
    components.synthesize()
    
    const utils = new SampleDir(project, "utils", {files: {"index.tsx": ""}})
    utils.synthesize()
  
    const constants = new SampleDir(project, "constants", {files: {"index.tsx": ""}})
    constants.synthesize()
  
    // Add _app.tsx file
    const app_file = new SampleFile(project, "./pages/_app.tsx", { contents: "// TODO" })
    app_file.synthesize()
  
    // Eslint set-up THIS DOESNT WORK RN AaaAaAaa
    /*const eslint = new Eslint(project, {
      dirs: ["."],
      fileExtensions: [".js", ".jsx", ".ts", ".tsx"],
      prettier: true,
    })
    eslint.addRules(ESLINT_RULES)*/
    
    return project
  }