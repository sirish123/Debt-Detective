import * as vscode from "vscode";
import { PkgInstaller } from "./pkgInstaller";
import { SidebarDataProvider } from "./sidebarDataProvider";
import fs = require("fs");

async function getDiagnostics(
  doc: vscode.TextDocument
): Promise<vscode.Diagnostic[]> {
  const text = doc.getText();
  const diagnostics = new Array<vscode.Diagnostic>();

  const textArr: string[] = text.split(/\r\n|\n/);

  const packages: string[] = [];

  for (let i = 0; i < textArr.length; i++) {
    const line = textArr[i];
    if (line.includes("import")) {
      const pkg = line.split(" ")[1];
      packages.push(pkg);
    }
  }

  //trying for one package

  //run pipdeptree to get the dependencies in the terminal in background

  /*
    script to run in terminal

    1) venv\Scripts\activate  activate venv
    2) pipdeptree -p <package_name> > output.txt
  */

  const shellExec = new vscode.ShellExecution(
    `venv\\Scripts\\activate && pipdeptree -p ${packages[0]}> output.txt`
  );

  //execute the task and get the output stored in a variable named depVersions

  await vscode.tasks.executeTask(
    new vscode.Task(
      { type: "pkginstaller" },
      vscode.TaskScope.Workspace,
      "PkgInstaller",
      "Pkg Installer",
      shellExec,
      "pipdeptree"
    )
  );

  // const depVersions = await getDepFromOutput();
  // console.log(depVersions);

  return diagnostics;
}

async function getDepFromOutput(): Promise<string[]> {
  const depVersions: string[] = [];
  console.log("getDepFromOutput");
  const text = await vscode.workspace.openTextDocument("output.txt");
  console.log(text);
  const textArr: string[] = text.getText().split(/\r\n|\n/);

  depVersions.push(textArr[0]);

  return depVersions;
}

export async function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("dependencies");

  const handler = async (doc: vscode.TextDocument) => {
    if (!doc.fileName.endsWith(".py")) {
      return;
    }
    console.log("handler");
    const diagnostics = await getDiagnostics(doc);
    diagnosticCollection.set(doc.uri, diagnostics);
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
    didOpen,
    didSave,
    didChange
    //codeActionProvider
  );
}

export function deactivate() {}
