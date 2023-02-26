import * as vscode from "vscode";
import { PkgInstaller } from "./pkgInstaller";

async function getDiagnostics(
  doc: vscode.TextDocument
): Promise<vscode.Diagnostic[]> {
  const text = doc.getText();
  const diagnostics = new Array<vscode.Diagnostic>();

  const textArr: string[] = text.split(/\r\n|\n/);
  const packages = textArr;
  console.log(packages);

  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];

    diagnostics.push({
      severity: vscode.DiagnosticSeverity.Information,
      message: `Package ${pkg} is not installed`,
      code: "pkg-installer",
      source: "pkg-installer",
      range: new vscode.Range(i, 0, pkg.length, i),
    });
  }

  return diagnostics;
}

export async function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("pkg-installer");

  const handler = async (doc: vscode.TextDocument) => {
    if (!doc.fileName.endsWith(".js")) {
      return;
    }
    //console.log("handler");
    //console.log(doc.fileName);
    const diagnostics = await getDiagnostics(doc);
    diagnosticCollection.set(doc.uri, diagnostics);
    console.log(diagnostics);
  };

  if (vscode.window.activeTextEditor) {
    await handler(vscode.window.activeTextEditor.document);
  }

  const didOpen = vscode.workspace.onDidOpenTextDocument((doc) => handler(doc));
  const didChange = vscode.workspace.onDidChangeTextDocument((e) =>
    handler(e.document)
  );
  const didSave = vscode.workspace.onDidSaveTextDocument((doc) => handler(doc));
  const codeActionProvider = vscode.languages.registerCodeActionsProvider(
    "javascript",
    new PkgInstaller(context)
  );

  context.subscriptions.push(
    diagnosticCollection,
    didOpen,
    didSave,
    didChange,
    codeActionProvider
  );
}

export function deactivate() {}
