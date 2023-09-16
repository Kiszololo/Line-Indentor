import { App, Editor, EditorPosition, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';


export default class calloutIntegrator extends Plugin {
//I ran out of energy so I'll comment on this later I just want to push it
	onload() {

		function anchorhead(head: EditorPosition, anchor: EditorPosition): boolean {
			if (head.line > anchor.line) {
				return true;
			} else if (head.line < anchor.line) {
				return false;
			} else {
				if (head.ch > anchor.ch) {
					return true;
				} else {
					return false;
				}
			}
		}

		/*** ADDS "> " AT BEGINNING OF EACH LINE ***/
		this.addCommand({
			id: 'callout-integrate',
			name: 'integrate',
			editorCallback: (editor: Editor) => {

				let selection = editor.getSelection(); 									//gets highlighted selection

				if (editor.somethingSelected()) { //if text highlighted -> integrate whole block

					let selectHead = editor.getCursor('head');							//gets beginning/end of highlighted section			
					let selectAnchor = editor.getCursor('anchor');

					editor.replaceSelection("> " + selection.replace(/\n/g, "\n> ")); 	//adds "> " before each line; need the initial "> " separately as it doesn't register as a new line

					if (anchorhead(selectHead, selectAnchor)) {
						selectHead.ch += 2;
					} else {
						selectAnchor.ch += 2;
					}
					editor.setSelection(selectAnchor, selectHead);						//re-highlights text

				} else { //if no text highlighted -> integrate line containing cursor

					let cursorPos = editor.getCursor();									//gets cursor position

					let currentLine = editor.getLine(cursorPos.line);					//add "> " at beginning of line
					editor.setLine(cursorPos.line, ("> " + currentLine));
					
					cursorPos.ch += 2;													//moves cursor to compensate for added characters
					editor.setCursor(cursorPos);
				}
			}
		})
		this.addCommand({
			id: 'callout-unintegrate',
			name: 'un-integrate',
			editorCallback: (editor: Editor) => {

				let selection = editor.getSelection(); 									//gets highlighted selection

				if (editor.somethingSelected()) { //if text highlighted -> remove all "> " following a line break

					let selectHead = editor.getCursor('head');							//get beginning/end position of highlighted section
					let selectAnchor = editor.getCursor('anchor');
					let movement = 0;

					if (selection.charAt(0) === '>') { 									//find and cut initial ">"
						selection = selection.substring(1);

						movement --;

						if (selection.charAt(0) === ' ') {								//find and cut initial " "
							selection = selection.substring(1);

							movement --;

						}
					}

				if (anchorhead(selectHead, selectAnchor)) {
					selectHead.ch += movement;
				} else {
					selectAnchor.ch += movement;
				}

				editor.replaceSelection(selection.replace(/\n> /g, "\n")); 			// cuts every "> " occurring after a new line
				editor.setSelection(selectAnchor, selectHead);						//re-highlight block
				
				} else { //if no text highlighted -> cut "> " at beginning of line

					let cursorPos = editor.getCursor();								//get cursor position and line number
					let currentLine = editor.getLine(cursorPos.line);

					if (currentLine.charAt(0) === '>') {							//cut ">"
						currentLine = currentLine.substring(1);
						cursorPos.ch --;											//move cursor to compensate

						if (currentLine.charAt(0) === ' ') {						//cut " "
							currentLine = currentLine.substring(1);
							cursorPos.ch --;										//move cursor to compensate
						}
						
						editor.setLine(cursorPos.line, currentLine);				//push changes to new line
						editor.setCursor(cursorPos);								//execute cursor move
					}
				}
			}
		})
	}

	onunload() {

	}
}