import * as vscode from "vscode";

export class PkgInstaller implements vscode.CodeActionProvider {
  constructor(context: vscode.ExtensionContext) {
    const command = vscode.commands.registerCommand(
      "pkg-installer.installModule",
      async (range: vscode.Range) => {
        vscode.window.activeTextEditor?.document.save();
        const text = vscode.window.activeTextEditor?.document.getText(range);
        console.log("consturctor");
        console.log(text);
        const shellExec = new vscode.ShellExecution(`npm i ${text}`);

        vscode.tasks.executeTask(
          new vscode.Task(
            { type: "pkginstaller" },
            vscode.TaskScope.Workspace,
            "PkgInstaller",
            "Pkg Installer",
            shellExec,
            "npm"
          )
        );
      }
    );
    context.subscriptions.push(command);
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    return context.diagnostics
      .filter((diagnostic) => diagnostic.code === "pkg-installer")
      .map((diagnostic) => this.createCommandCodeAction(diagnostic));
  }

  private createCommandCodeAction(
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const text = vscode.window.activeTextEditor?.document.getText(
      diagnostic.range
    );
    const action = new vscode.CodeAction(
      `Install ${text} module...`,
      vscode.CodeActionKind.QuickFix
    );
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    action.command = {
      command: "pkg-installer.installModule",
      title: "Learn more about emojis",
      tooltip: "This will open the unicode emoji page.",
      arguments: [diagnostic.range],
    };
    return action;
  }
}
