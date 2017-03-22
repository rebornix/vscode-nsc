'use strict';

import * as vscode from 'vscode';

export class SpellProvider implements vscode.CodeActionProvider {
	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.Command[] {
		let diagnostic: vscode.Diagnostic = context.diagnostics[0];

		let match: string[] = diagnostic.message.match(/([a-zA-Z0-9,\ ]+)$/);
		let suggestionstring: string = '';

		let commands: vscode.Command[] = [];

		// Add each suggestion
		if (match && match.length >= 2) {
			suggestionstring = match[1];

			let suggestions: string[] = suggestionstring.split(/\,\ /g);

			// Add suggestions to command list
			suggestions.forEach(function (suggestion) {
				commands.push({
					title: 'Replace with \'' + suggestion + '\'',
					command: 'aaa',
					arguments: [document, diagnostic, suggestion]
				});
			});
		}

		return commands;
	}
}