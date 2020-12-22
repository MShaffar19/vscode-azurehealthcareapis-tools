/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as vscode from 'vscode';
import * as workspaceStateConstants from '../../core/common/constants/workspace-state';
import * as workspaceConfigurationConstants from '../../core/common/constants/workspace-configuration';
import * as interaction from '../common/file-dialog/file-dialog-interaction';
import { globals } from '../../core/globals';
import { TemplateManagerFactory } from '../../core/template-manager/template-manager-factory';
import { showInputBox } from '../common/input-box/input-box';
import localize from '../../i18n/localize';

export async function pushTemplatesCommand() {
	// Add push bar
	const pushBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	pushBar.text = '$(sync~spin) Pushing templates...';
	pushBar.show();

	try {
		// Get the image reference
		const imageReference = await showInputBox(localize('message.inputYourImageReference'), workspaceStateConstants.ImageReferenceKey);
		if (!imageReference) {
			return undefined;
		}

		// Get the template folder
		const templateFolder = globals.settingManager.getWorkspaceConfiguration(workspaceConfigurationConstants.TemplateFolderKey);

		// Confirm the template folder
		const selectedTemplateFolder = await interaction.openDialogSelectFolder(localize('message.selectRootTemplateFolder'), templateFolder);
		if (!selectedTemplateFolder) {
			return undefined;
		}

		// Create the template manager
		const templateManager = TemplateManagerFactory.getInstance().createTemplateManager();

		// Execute the push process
		const output = templateManager.pushTemplates(imageReference, selectedTemplateFolder.fsPath);
		
		// Show ouput message
		vscode.window.showInformationMessage(output.replace(/\n/g, '; ').replace(/Uploading/g, 'Uploaded'));
	} finally {
		// Hide the push bar
		pushBar.hide();
	}
}