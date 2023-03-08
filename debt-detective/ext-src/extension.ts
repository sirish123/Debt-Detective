import * as path from "path";
import * as vscode from "vscode";
import axios from "axios";

import {
  WebviewViewProvider,
  WebviewView,
  Webview,
  Uri,
  EventEmitter,
  window,
} from "vscode";

export let required: { [key: string]: string } = {};

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

      for (let i = 0; i < textArr.length; i++) {
        if (i === 0 && textArr[i].includes("==")) {
          console.log("first line");
          const pkg = textArr[i].split("==")[0];
          const version = textArr[i].split("==")[1];
          required[pkg] = version;
        } else if (i > 0) {
          if (textArr[i] === "") {
            continue;
          }

          try {
            const line = textArr[i].replace(/\s/g, "");
            console.log(line);
            const installed = line.split("installed:")[1];
            const inst = installed.replace(/]/g, "");
            console.log(installed);
            const pkg = line.split("[")[0];
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
  const handler = async (doc: vscode.TextDocument) => {
    if (!doc.fileName.endsWith(".py")) {
      return;
    }
    console.log("inside handler");
    await getDepOfPkg(doc);
  };

  if (vscode.window.activeTextEditor) {
    await handler(vscode.window.activeTextEditor.document);
  }

  const didSave = vscode.workspace.onDidSaveTextDocument((doc) => handler(doc));

  context.subscriptions.push(
    didSave,
    vscode.window.registerWebviewViewProvider(
      "react-webview.webview",
      new ReactPanel(
        context.extensionUri,
        context.extensionPath,
        vscode.ViewColumn.One
      )
    )
  );
}

/**
 * Manages react webview panels
 */
class ReactPanel implements WebviewViewProvider {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: ReactPanel | undefined;

  private static readonly viewType = "react";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _extensionUri: Uri;
  private _disposables: vscode.Disposable[] = [];

  constructor(
    private readonly extensionUri: Uri,
    private readonly extensionPath: string,
    private data: any,
    private _view: any = null
  ) {
    this._extensionPath = extensionPath;
    this._extensionUri = extensionUri;
  }

  private onDidChangeTreeData: EventEmitter<any | undefined | null | void> =
    new EventEmitter<any | undefined | null | void>();

  refresh(context: any): void {
    this.onDidChangeTreeData.fire(null);
    // this._view.webview.html = this._getHtmlForWebview(this._view?.webview);
    this._view.webview.html = this._getHtmlForWebview();
  }

  //called when a view first becomes visible
  resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    // webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    webviewView.webview.html = this._getHtmlForWebview();
    this._view = webviewView;
    this.activateMessageListener();
  }

  private activateMessageListener() {
    this._view.webview.onDidReceiveMessage(
      (message: { action: any; data: { message: string } }) => {
        switch (message.action) {
          case "SHOW_WARNING_LOG":
            window.showWarningMessage(message.data.message);
            break;
          default:
            break;
        }
      }
    );
  }

  public dispose() {
    ReactPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview() {
    const manifest = require(path.join(
      this._extensionPath,
      "build",
      "asset-manifest.json"
    ));
    const mainScript = manifest["files"]["main.js"];
    const mainStyle = manifest["files"]["main.css"];

    const scriptPathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, "build", mainScript)
    );
    const scriptUri = scriptPathOnDisk.with({ scheme: "vscode-resource" });
    const stylePathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, "build", mainStyle)
    );
    const styleUri = stylePathOnDisk.with({ scheme: "vscode-resource" });

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<title>React App</title>
				<link rel="stylesheet" type="text/css" href="${styleUri}">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
				<base href="${vscode.Uri.file(path.join(this._extensionPath, "build")).with({
          scheme: "vscode-resource",
        })}/">
			</head>

			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
				
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
