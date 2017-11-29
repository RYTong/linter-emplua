'use babel';

import {CompositeDisposable} from 'atom';
import {parse} from 'luaparse';

export default {

    subscriptions: null,

    activate(state) {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

    },

    deactivate() {
        this.subscriptions.dispose();
    },

    serialize() {
        return {};
    },

    provideLinter() {
        return {
            name: 'EMPLuaLint',
            grammarScopes: ['source.lua'],
            scope: 'file',
            lintsOnChange: false,
            lint: (editor) => {
                return new Promise(function(resolve, reject) {
                    try{
                        parse(editor.getText());
                        resolve([]);
                    } catch (err){
                        let iLine = err.line - 1
                        let iCol = err.column
                        let oLineRange = editor.getBuffer().rangeForRow(iLine, false)
                        let sMessage = err.message.match(/\[\d+:\d+] (.*)/)[1]
                        resolve([new_lua_linter_msg(editor.getPath(), iLine, iCol ,oLineRange, sMessage)]);
                    }
                });
            }
        }
    }
};


new_lua_linter_msg = (editorPath, iLine, iCol, oRange, sMsg) => {
    let start = [iLine, iCol];
    let stop = [iLine, oRange.end.column];
    let excerpt = sMsg;
    let desc = "";
    return {
        severity: 'error',
        location: {
            file: editorPath,
            position: [start, stop]
        },
        excerpt: excerpt,
        description: desc
    }
}
