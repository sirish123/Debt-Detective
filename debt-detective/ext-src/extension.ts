import * as vscode from "vscode";
import ReactPanel from "./panel";
import axios from "axios";
import * as fs from "fs";

export let installed: { [key: string]: string } = {};
let required: { [key: string]: string } = {};

declare module namespace {
  export interface SecurityObject {
    vId: string;
    cVersion: string;
    pkgName: string;
    CVE: string;
    advisory: string;
  }
}

let message = "starting..";

function compareInstalledAndRequiredVersions(
  doc: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection
) {
  let conflicts: any = [];
  let cur_data: { [key: string]: string } = {};

  const text = doc.getText();

  const textArr: string[] = text.split(/\r\n|\n/);

  for (let i = 0; i < textArr.length; i++) {
    const line = textArr[i];
    if (line.includes("==")) {
      const pkg = line.split("==")[0];
      const version = line.split("==")[1];
      cur_data[pkg] = version;
    }
  }

  let idx = -1;

  for (let pkg in cur_data) {
    idx++;
    if (pkg in installed) {
      try {
        //cur_data[pkg] = "1.0.0";
        //make it 1.0
        //remove the last thing after the dot

        let isConflict = false;
        const cur_data_ver = cur_data[pkg];
        const cur_data_ver_list = cur_data[pkg].split(".");

        const req_ver = required[pkg];
        const req_ver_list = required[pkg].split(".");

        //compare the first two elements of the list
        //handle the case where the length of one of the list is 1
        //here these are version numbers

        if (req_ver_list.length == 1) {
          if (parseFloat(cur_data_ver_list[0]) < parseFloat(req_ver_list[0])) {
            isConflict = true;
          }
        } else if (req_ver_list.length >= 2 && cur_data_ver_list.length >= 2) {
          if (
            parseFloat(cur_data_ver_list[0]) < parseFloat(req_ver_list[0]) ||
            (parseFloat(cur_data_ver_list[0]) == parseFloat(req_ver_list[0]) &&
              parseFloat(cur_data_ver_list[1]) < parseFloat(req_ver_list[1]))
          ) {
            isConflict = true;
          }
        }

        if (isConflict) {
          conflicts.push({
            range: new vscode.Range(idx, 0, idx, 100),
            message: `Package ${pkg} is outdated. Required version:>= ${req_ver}, version in txt file: ${cur_data_ver} `,
            severity: vscode.DiagnosticSeverity.Warning,
            source: "debt-detective",
            code: "debt-detective",
          });
          // vscode.window.showWarningMessage(
          //   `Package ${pkg} is outdated. Required version:>= ${req_ver}, version in txt file: ${cur_data_ver} `
          // );
        }
      } catch (err) {}
    }
  }

  diagnosticCollection.set(doc.uri, conflicts);
}

function showSquizzleForSecurity(
  doc: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection
) {
  let analysis_code = {
    Security: [
      {
        SEVERITY: "MEDIUM",
        CONFIDENCE: "HIGH",
        PROBLEM:
          "Audit url open for permitted schemes. Allowing use of file:/ or custom schemes is often unexpected.",
        LINENUMBER: 208,
        COLOFFSET: 19,
      },
      {
        SEVERITY: "HIGH",
        CONFIDENCE: "HIGH",
        PROBLEM: "Audit url open for permitted schemes.",
        LINENUMBER: 28,
        COLOFFSET: 10,
      },
      {
        SEVERITY: "LOW",
        CONFIDENCE: "HIGH",
        PROBLEM: "Audit url",
        LINENUMBER: 29,
        COLOFFSET: 10,
      },
    ],
    Standard: [],
    Depreciated: [],
  };

  const diagnostics = new Array<vscode.Diagnostic>();
  for (let i = 0; i < analysis_code.Security.length; i++) {
    let line = analysis_code.Security[i].LINENUMBER;
    let col = analysis_code.Security[i].COLOFFSET;
    let msg = analysis_code.Security[i].PROBLEM;
    let code = "Confidence: " + analysis_code.Security[i].CONFIDENCE;
    let severity = analysis_code.Security[i].SEVERITY;
    let severity_color;
    if (severity == "LOW") {
      severity_color = vscode.DiagnosticSeverity.Information;
    } else if (severity == "MEDIUM") {
      severity_color = vscode.DiagnosticSeverity.Warning;
    } else if (severity == "HIGH") {
      severity_color = vscode.DiagnosticSeverity.Error;
    }
    // diagnostics.push({
    //   severity: severity_color,
    //   message: msg,
    //   code: code,
    //   source: "debt-detective",
    //   range: new vscode.Range(line, col, line, col + 100),
    // });
  }

  diagnosticCollection.set(doc.uri, diagnostics);
}

/*
 * @param doc: vscode.TextDocument
 * @returns: void
 * gets the dependencies of the packages in the current file and its versions
 */
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
  console.log(packages);

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

/*
 * extension activate function
 * analyzes the file to get package names with regex
 * makes api call to backend
 * creates a react panel and populates it with data from backend
 */
export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("debt-detective");

  const handler = async (doc: vscode.TextDocument) => {
    if (doc.fileName.includes("requirements.txt")) {
      compareInstalledAndRequiredVersions(doc, diagnosticCollection);
    }

    if (!doc.fileName.endsWith(".py")) {
      return;
    }
    if (!vscode.workspace.workspaceFolders) return;

    const venvPath = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\venv";

    if (!fs.existsSync(venvPath)) {
      return;
    }

    console.log("inside handler");

    //get the whole code in the file and send it as a api call to backend
    const code: string = doc.getText();
    //console.log(code);

    //await axios.post("http://localhost:8000/code", { code: code });

    showSquizzleForSecurity(doc, diagnosticCollection);

    getDepOfPkg(doc);

     // Highlighting the code
    const startPos = new vscode.Position(0, 0);
    const endPos = new vscode.Position(0, 5);
    const range = new vscode.Range(startPos, endPos);

    const decoration = {
      range,
      hoverMessage: "Hello World",
    };

    const decorationType = vscode.window.createTextEditorDecorationType({
      isWholeLine: false,
      backgroundColor: "rgba(0, 128, 0, 0.5)",
    });
    vscode.window.activeTextEditor?.setDecorations(decorationType, [decoration]);

  };

  if (vscode.window.activeTextEditor) {
    handler(vscode.window.activeTextEditor.document);
  }

  const didOpen = vscode.workspace.onDidOpenTextDocument((doc) => handler(doc));
  const didChange = vscode.workspace.onDidChangeTextDocument((e) =>
    handler(e.document)
  );

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

  //regex parsing
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
          installed[pkg] = version;
          required[pkg] = version;
        } else if (i > 0) {
          if (textArr[i] === "") {
            continue;
          } else if (textArr[i].includes("==")) {
            const pkg = textArr[i].split("==")[0];
            const version = textArr[i].split("==")[1];
            installed[pkg] = version;
            required[pkg] = version;
          }

          try {
            const line = textArr[i].replace(/\s/g, "");
            console.log(line);
            const split_installed = line.split("installed:")[1];
            const inst = split_installed.replace(/]/g, "");

            const pkg = line.split("[")[0];
            const pkgName = pkg.replace(/-/g, "");
            installed[pkgName] = inst;

            const split_required = line.split("required:")[1];
            const split_comma = split_required.split(",");
            const req = split_comma[0].replace(/]/g, "");

            //remove >=, <=, >, <, ==, ~=, etc
            const req2 = req.replace(/(>=|<=|>|<|==|~=)/g, "");

            required[pkgName] = req2;
          } catch (err) {
            //console.log(err);
          }
        }
      }

      let temp: string = "";

      for (const [key, value] of Object.entries(installed)) {
        temp += `${key}==${value},`;
      }
      if (temp[temp.length - 1] === ",") temp = temp.slice(0, -1);
      console.log(temp);

      console.log(required);

      // //post to localhost:8000 with query param {val: temp}

      // let url: string = "http://localhost:8000";

      // //make url as localhost:8000?val=temp
      // url += `?val=${temp}`;
      // console.log(url);

      // const jsonObject: any = [];

      // try {
      //   const data = await axios.post(url);

      //   jsonObject.push(data.data);

      //   //write to json file
      //   if (!vscode.workspace.workspaceFolders) return;
      //   else {
      //     //create a json file named analysis.json
      //     const jsonPath =
      //       vscode.workspace.workspaceFolders[0].uri.fsPath + "\\analysis.json";
      //     fs.writeFileSync(jsonPath, JSON.stringify(jsonObject, null, 2));
      //   }

      //   message = "received data";
      //   console.log(data);
      // } catch (err) {
      //   console.log("catched error");
      //   message = "received";
      // }

      // message = JSON.stringify(jsonObject);

      // context.subscriptions.push(
      //   vscode.window.registerWebviewViewProvider(
      //     "react-webview.webview",
      //     new ReactPanel(
      //       context.extensionUri,
      //       context.extensionPath,
      //       message,
      //       vscode.ViewColumn.One
      //     )
      //   )
      // );
    } else {
      console.log("no file");
    }
  });

  context.subscriptions.push(
    didSave,
    onDidEndTask,
    venvHelper,
    didOpen,
    didChange
  );
}
