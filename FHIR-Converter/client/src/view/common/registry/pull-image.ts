/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import localize from '../../../i18n/localize';
import * as vscode from 'vscode';
import * as interaction from '../../common/file-dialog/file-dialog-interaction';
import { TemplateManagerFactory } from '../../../core/template-manager/template-manager-factory';
import * as fileUtils from '../../../core/common/utils/file-utils'; 

export async function pullImage(imageReference, text, refineOutput= false) {
	// Add pull bar
	const pullBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	pullBar.text = `$(sync~spin) ${text}...`;
	pullBar.show();

	try {
		// Select the output folder
		const outputFolder = await interaction.openDialogSelectFolder(localize('message.selectOutputFolder'));
		if (!outputFolder) {
			return undefined;
		}

		// Check if the directory is empty
		let force = false;
		if (! await fileUtils.isEmptyDir(outputFolder.fsPath)) {
			const select = await vscode.window.showWarningMessage(
				localize('message.nonEmptyFolderForcePushOrNot'), 
				localize('message.force'), 
				localize('message.cancel'));
			if (select ===  localize('message.force')) {
				force = true;
			} else {
				return undefined;
			}
		}
		// Create the template manager
		const templateManager = TemplateManagerFactory.getInstance().createTemplateManager();

		// Execute the pull process
		let output = templateManager.pullTemplates(imageReference, outputFolder.fsPath, force);
		
		if (refineOutput) {
			// Fix the wrong message from engine temporarily
			output = output.replace('pulled templates to', 'pulled sample data to');
		}
		// Show ouput message
		vscode.window.showInformationMessage(output.replace(/\n/g, '; '));
	} finally {
		// Hide the pull bar
		pullBar.hide();
	}
}
