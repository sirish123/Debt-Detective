import * as path from "path";
import * as vscode from "vscode";

import {
  WebviewViewProvider,
  WebviewView,
  Webview,
  Uri,
  EventEmitter,
  window,
} from "vscode";
import React from "react";

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

  private _data: string;

  constructor(
    private readonly extensionUri: Uri,
    private readonly extensionPath: string,
    private data: any,
    private _view: any = null
  ) {
    this._extensionPath = extensionPath;
    this._extensionUri = extensionUri;
    this._data = data;
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
    this._view.webview.onDidReceiveMessage((message) => {
      switch (message.action) {
        case "SHOW_WARNING_LOG":
          window.showWarningMessage(message.data.message);
          break;
        default:
          break;
      }
    });
  }

  public update(data: any) {
    this._data = data;
    this._view.webview.html = this._getHtmlForWebview();
  }

  public static createOrShow(
    extensionUri: Uri,
    extensionPath: string,
    data: any
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (ReactPanel.currentPanel) {
      ReactPanel.currentPanel._panel.reveal(column);
      ReactPanel.currentPanel.refresh(data);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      ReactPanel.viewType,
      "React",
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,
        localResourceRoots: [extensionUri],
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
                  <base href="${vscode.Uri.file(
                    path.join(this._extensionPath, "build")
                  ).with({
                    scheme: "vscode-resource",
                  })}/">
              </head>
  
              <body>
                  <noscript>You need to enable JavaScript to run this app.</noscript>
                  
                  <div id="root" parameter='${this._data}'></div>
                  
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

export default ReactPanel;
