import * as vscode from "vscode";
import ReactPanel from "./panel";
import axios from "axios";
import * as fs from "fs";

export let required: { [key: string]: string } = {};

declare module namespace {
  export interface SecurityObject {
    vId: string;
    cVersion: string;
    pkgName: string;
    CVE: string;
    advisory: string;
  }
}

let message = "omk";
async function getDepOfPkg(doc: vscode.TextDocument) {
  const text = doc.getText();

  message = "updating...";

  const textArr: string[] = text.split(/\r\n|\n/);

  const packages: string[] = [];

  for (let i = 0; i < textArr.length; i++) {
    const line = textArr[i];
    if (line.includes("import")) {
      const pkg = line.split(" ")[1];
      packages.push(pkg);
    }
  }

  //shell execution for all packages
  // pipdeptree -p <pkg1> <pkg2> <pkg3> > output.txt

  const shellExec = new vscode.ShellExecution(
    `venv\\Scripts\\activate && pipdeptree -p ${packages.join(
      ","
    )} > output.txt`
  );

  // const shellExec = new vscode.ShellExecution(
  //   `venv\\Scripts\\activate && pipdeptree -p ${packages[0]} > output.txt`
  // );

  message = "updating2...";
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
}

// export async function makeApiCall(required: { [key: string]: string }) {
//   const data = await axios.get(`http://127.00.1:8000/pkg`, {
//     params: { required },
//   });
//   console.log(data);
//   message = "done";
// }

export function activate(context: vscode.ExtensionContext) {
  const handler = (doc: vscode.TextDocument) => {
    if (!doc.fileName.endsWith(".py")) {
      return;
    }
    if (!vscode.workspace.workspaceFolders) return;

    const venvPath = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\venv";

    if (!fs.existsSync(venvPath)) {
      return;
    }

    console.log("inside handler");

    //getDepOfPkg(doc);
  };

  if (vscode.window.activeTextEditor) {
    handler(vscode.window.activeTextEditor.document);
  }

  const venvHelper = vscode.commands.registerCommand(
    "debtdetective.venv",
    () => {
      if (!vscode.workspace.workspaceFolders) return;

      //check if venv exists
      const venvPath =
        vscode.workspace.workspaceFolders[0].uri.fsPath + "\\venv";

      if (fs.existsSync(venvPath)) {
        vscode.window.showInformationMessage("Venv already exists");
        return;
      }

      vscode.window.showInformationMessage("Installing Venv");
      const shellExec = new vscode.ShellExecution(
        "conda activate base && python -m venv venv && venv\\Scripts\\activate && pip install -r requirements.txt"
      );

      vscode.tasks.executeTask(
        new vscode.Task(
          { type: "venv" },
          vscode.TaskScope.Workspace,
          "Venv",
          "Venv",
          shellExec,
          "venv"
        )
      );

      vscode.window.showInformationMessage("Venv installed");
    }
  );

  const didSave = vscode.workspace.onDidSaveTextDocument((doc) => handler(doc));

  const onDidEndTask = vscode.tasks.onDidEndTask(async () => {
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

      let temp: string = "";

      for (const [key, value] of Object.entries(required)) {
        temp += `${key}==${value},`;
      }
      if (temp[temp.length - 1] === ",") temp = temp.slice(0, -1);
      console.log(temp);

      //post to localhost:8000 with query param {val: temp}

      let url: string = "http://localhost:8000";

      //make url as localhost:8000?val=temp
      url += `?val=${temp}`;
      console.log(url);
      let req_msg: string = "hello";
      try {
        const data = await axios.post(url);

        message = "received data";
        console.log(data);

        if (data) {
          req_msg = JSON.stringify(data.data);
        }
      } catch (err) {
        message = "received";
      }

      context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
          "react-webview.webview",
          new ReactPanel(
            context.extensionUri,
            context.extensionPath,
            req_msg,
            vscode.ViewColumn.One
          )
        )
      );
    } else {
      console.log("no file");
    }
  });

  message = "hello";

  context.subscriptions.push(
    didSave,
    onDidEndTask,
    venvHelper,
    vscode.window.registerWebviewViewProvider(
      "react-webview.webview",
      new ReactPanel(
        context.extensionUri,
        context.extensionPath,
        message,
        vscode.ViewColumn.One
      )
    )
  );
}
