/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import * as net from 'net';
import * as childProcess from 'child_process';
import * as path from 'path';
import { EventEmitter } from 'events';

export interface ICommand {
	command: string;
	resolve: (value?: any) => void
	reject: (error?: any) => void
}

export class SpellCheckProcess extends EventEmitter {
	private buffer: string;
	private pendingResponses: ICommand[];
	private pendingCommands: any[];
	private scProcess: childProcess.ChildProcess;

	public get pid() {
		return this.scProcess.pid;
	}

	public constructor() {
		super();
		this.pendingResponses = [];
		this.pendingCommands = [];
		this.scProcess = childProcess.spawn(path.resolve(__dirname, '../spellchecker'));

		this.scProcess.stdout.on('data', (data: Buffer) => {
			data.toString().split('\n').filter(val => val !== '').forEach(line => {
				this.FinishCmd(line);
			});
		});

		this.scProcess.stderr.on('data', data => {
			console.log('stderr:');
			console.log(data.toString());
		});

		this.scProcess.on('close', code => {
			console.log('close');
		});
	}

	public Enqueue(cmd: string): Promise<any> {
		var pro = new Promise<any>((resolve, reject) => {
			var newCommand = {
				command: cmd,
				resolve: resolve,
				reject: reject
			};
			this.pendingResponses.push(newCommand);
			this.scProcess.stdin.write('chkb ' + cmd + '\n');
		});

		return pro;
	}

	private FinishCmd(result: any): void {
		if (this.pendingResponses.length > 0) {
			this.pendingResponses[0].resolve(result);
			this.pendingResponses.shift();
		}
	}
}
