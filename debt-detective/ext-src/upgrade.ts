import * as vscode from "vscode";

export class Upgrade implements vscode.CodeActionProvider {
  constructor(context: vscode.ExtensionContext) {
    const command = vscode.commands.registerCommand(
      "debt-detective.upgrade",
      async (range: vscode.Range) => {
        vscode.window.activeTextEditor?.document.save();
        const text = vscode.window.activeTextEditor?.document.getText(range);
        const useYarn = !!(await vscode.workspace.findFiles("yarn-lock"));
        const shellExec = useYarn
          ? new vscode.ShellExecution(`yarn add --dev ${text}`)
          : new vscode.ShellExecution(`npm install --save-dev ${text}`);

        vscode.tasks.executeTask(
          new vscode.Task(
            { type: "shell" },
            vscode.TaskScope.Workspace,
            `Install ${text} package`,
            "debt-detective",
            shellExec,
            "$npm"
          )
        );
      }
    );
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    return context.diagnostics
      .filter((diagnostic) => diagnostic.source === "debt-detective-version")
      .map((diagnostic) => this.createCommandCodeAction(diagnostic));
  }

  private createCommandCodeAction(
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const text = vscode.window.activeTextEditor?.document.getText(
      diagnostic.range
    );
    const action = new vscode.CodeAction(
      `Install ${text} package...`,
      vscode.CodeActionKind.QuickFix
    );
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    action.command = {
      command: "debt-detective.upgrade",
      title: "Learn more about this package",
      tooltip: "This will open the package page on npmjs.com",
      arguments: [diagnostic.range],
    };
    return action;
  }
}
