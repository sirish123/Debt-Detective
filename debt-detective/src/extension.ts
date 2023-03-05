import * as vscode from "vscode";
import { PkgInstaller } from "./pkgInstaller";
import { SidebarDataProvider } from "./sidebarDataProvider";
import fs = require("fs");
import axios from "axios";

// async function getDiagnostics(
//   doc: vscode.TextDocument
// ): Promise<vscode.Diagnostic[]> {
//   const text = doc.getText();
//   const diagnostics = new Array<vscode.Diagnostic>();

//   const textArr: string[] = text.split(/\r\n|\n/);

//   const packages: string[] = [];

//   for (let i = 0; i < textArr.length; i++) {
//     const line = textArr[i];
//     if (line.includes("import")) {
//       const pkg = line.split(" ")[1];
//       packages.push(pkg);
//     }
//   }

//   const shellExec = new vscode.ShellExecution(
//     `venv\\Scripts\\activate && pipdeptree -p ${packages[0]} > output.txt`
//   );

//   await vscode.tasks.executeTask(
//     new vscode.Task(
//       { type: "pkginstaller" },
//       vscode.TaskScope.Workspace,
//       "PkgInstaller",
//       "Pkg Installer",
//       shellExec,
//       "pipdeptree"
//     )
//   );

//   // //wait till terminal is done
//   await new Promise((resolve) => setTimeout(resolve, 1000));

//   const uri = await vscode.workspace.findFiles("output.txt");

//   if (uri.length > 0) {
//     const text = await vscode.workspace.openTextDocument(uri[0]);
//     const textArr: string[] = text.getText().split(/\r\n|\n/);
//     console.log(textArr);
//   } else {
//     console.log("no file");
//   }

//   return diagnostics;
// }

async function getDepOfPkg(doc: vscode.TextDocument) {
  const text = doc.getText();

  const textArr: string[] = text.split(/\r\n|\n/);

  const packages: string[] = [];

  for (let i = 0; i < textArr.length; i++) {
    const line = textArr[i];
    if (line.includes("import")) {
      const pkg = line.split(" ")[1];
      packages.push(pkg);
    }
  }

  const shellExec = new vscode.ShellExecution(
    `venv\\Scripts\\activate && pipdeptree -p ${packages[0]} > output.txt`
  );

  let dependencies: string[] = [];

  vscode.tasks.executeTask(
    new vscode.Task(
      { type: "pkginstaller" },
      vscode.TaskScope.Workspace,
      "PkgInstaller",
      "Pkg Installer",
      shellExec,
      "pipdeptree"
    )
  );

  vscode.tasks.onDidEndTask(async () => {
    const uri = await vscode.workspace.findFiles("output.txt");

    if (uri.length > 0) {
      const text = await vscode.workspace.openTextDocument(uri[0]);
      const textArr: string[] = text.getText().split(/\r\n|\n/);
      console.log("end task");
      console.log(textArr);

      //make a json object with the package name and version of the package
      let required: { [key: string]: string } = {};

      for (let i = 0; i < textArr.length; i++) {
        if (i === 0 && textArr[i].includes("==")) {
          console.log("first line");
          const pkg = textArr[i].split("==")[0];
          const version = textArr[i].split("==")[1];
          required[pkg] = version;
        } else if (i > 0) {
          //sample line   - pydantic [required: >=1.6.2,<2.0.0,!=1.8.1,!=1.8,!=1.7.3,!=1.7.2,!=1.7.1,!=1.7, installed: 1.10.5]
          if (textArr[i] === "") {
            continue;
          }

          try {
            const line = textArr[i].replace(/\s/g, "");
            console.log(line);
            //get installed version
            const installed = line.split("installed:")[1];
            //remove ] from installed
            const inst = installed.replace(/]/g, "");
            console.log(installed);
            //get pkg name
            const pkg = line.split("[")[0];
            //remove all char of pkg till -
            const pkgName = pkg.replace(/-/g, "");

            required[pkgName] = inst;
          } catch (err) {
            console.log(err);
          }
        }
      }
      console.log(required);
      makeApiCall(required);
    } else {
      console.log("no file");
    }
  });
}

export async function makeApiCall(required: { [key: string]: string }) {
  const data = await axios.get(`http://127.00.1:8000/pkg`, {
    params: { required },
  });
  console.log(data);
}

export async function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("dependencies");

  const handler = async (doc: vscode.TextDocument) => {
    if (!doc.fileName.endsWith(".py")) {
      return;
    }
    console.log("handler");
    await getDepOfPkg(doc);

    // const diagnostics = await getDiagnostics(doc);
    // diagnosticCollection.set(doc.uri, diagnostics);
  };

  if (vscode.window.activeTextEditor) {
    await handler(vscode.window.activeTextEditor.document);
  }

  const didOpen = vscode.workspace.onDidOpenTextDocument((doc) => handler(doc));
  const didChange = vscode.workspace.onDidChangeTextDocument((e) =>
    handler(e.document)
  );
  const didSave = vscode.workspace.onDidSaveTextDocument((doc) => handler(doc));
  // const codeActionProvider = vscode.languages.registerCodeActionsProvider(
  //   "javascript",
  //   new PkgInstaller(context)
  // );

  //show all the documents in the workspace

  // const uris = await vscode.workspace.findFiles("**/*.js");

  // for (const uri of uris) {
  //   console.log(uri);
  //   // const doc = await vscode.workspace.openTextDocument(uri);
  //   // await handler(doc);
  // }

  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : "";

  // const sidebarDataProvider = new SidebarDataProvider(rootPath);
  // vscode.window.registerTreeDataProvider("debt-detective", sidebarDataProvider);
  // vscode.window.createTreeView("debt-detective", {
  //   treeDataProvider: sidebarDataProvider,
  // });

  context.subscriptions.push(
    diagnosticCollection,
    //didOpen,
    didSave
    //didChange
    //codeActionProvider
  );
}

export function deactivate() {}
