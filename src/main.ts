'use strict';
import * as vscode from 'vscode';
import * as cp from 'child_process';
import { SpellCheckProcess } from './spellCheckProcess';
import { SpellProvider } from './spellCheckProvider';

let spellDiagnostics: vscode.DiagnosticCollection;
let spellCheckProcess: SpellCheckProcess;

class Correction {
    public start: number;
    public end: number;
    public corrections: string[]
}

class CorrectionGroup {
    public result: Correction[];
}

export function activate(context: vscode.ExtensionContext) {
    let subscriptions: vscode.Disposable[] = context.subscriptions;
    spellDiagnostics = vscode.languages.createDiagnosticCollection('Spell Check');
    vscode.workspace.onDidOpenTextDocument(TriggerDiagnostics, this, subscriptions)
    vscode.workspace.onDidChangeTextDocument(TriggerDiffDiagnostics, this, subscriptions);
    vscode.workspace.onDidCloseTextDocument((textDocument) => {
        spellDiagnostics.delete(textDocument.uri);
    }, null, subscriptions);
    spellCheckProcess = new SpellCheckProcess();

    if (vscode.window.activeTextEditor) {
        TriggerDiagnostics(vscode.window.activeTextEditor.document);
    }
    vscode.languages.registerCodeActionsProvider("markdown", new SpellProvider())
}

function TriggerDiffDiagnostics(event: vscode.TextDocumentChangeEvent) {
    TriggerDiagnostics(event.document);
}

function TriggerDiagnostics(document: vscode.TextDocument) {
    if (document.languageId !== "markdown") {
        return;
    }

    let promises: Promise<any>[] = [];
    for (let i = 0; i < document.lineCount; i++) {
        let text = document.lineAt(i);
        promises.push(spellCheckProcess.Enqueue(text.text).then(value => {
            return {
                line: i,
                value: value
            };
        }));
    }

    let diagnostics: vscode.Diagnostic[] = [];

    Promise.all(promises).then(value => {
        for(let i = 0, len = value.length; i < len; i++) {
            let line = value[i].line;
            let val = value[i].value;
            let correctionGroup: CorrectionGroup = JSON.parse(val);
            correctionGroup.result.forEach(correction => {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(line, correction.start, line, correction.end), correction.corrections.join(', '), vscode.DiagnosticSeverity.Warning));
            });
        }

        spellDiagnostics.set(document.uri, diagnostics);
    });
}

export function deactivate() {
    process.kill(spellCheckProcess.pid, 'SIGTERM');
}