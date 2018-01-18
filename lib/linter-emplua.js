'use babel';

import {CompositeDisposable} from 'atom';
import {parse} from 'luaparse';
import $ from 'jquery';
import { checkSLT2, lintSLT2} from './lint-slt2';

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
                    let editorPath = editor.getPath(),
                        editorText = editor.getText();
                    try{

                        if (checkSLT2(editorText)){
                          let aErrArr = lintSLT2(editorText, editorPath);
                          if (aErrArr.length) {
                              mark_err(editorPath);
                              resolve(aErrArr);
                          }
                          // 之后做性能优化
                          // 预处理页面内容, 筛除 slt2内容, 转化 slt2 >>> 为\n,
                          // 这样做的目的是筛除 slt2 后仍保持页面错误定位准确

                          // let aSplitRe = editorText.split(/#{|}#/ig);
                          // console.log(aSplitRe, aSplitRe.length);

                          // 判断筛除 slt2 分隔符之后, 代码段是否为奇数个
                          // 如果不是, 则表明 slt2 分隔符未闭合 >>>
                          // 不准确,已修改为比作 slt 校验
                          // console.log(aSplitRe.length & 1);

                          let aNewRe = []
                          for (let i = 0; i < aSplitRe.length; i++) {
                              if (!(i & 1)) {
                                  aNewRe.push(aSplitRe[i]);
                              } else {
                                aNewRe = aNewRe.concat("tmpVar ");
                                sSlt = aSplitRe[i];
                                let aRe = sSlt.match(/\n/ig);
                                // console.log(i, sSlt, aRe);
                                if (aRe) {
                                    aNewRe = aNewRe.concat(aRe);
                                }
                              }
                          }
                          editorText = aNewRe.join("");

                        }
                        // console.log(editorText);

                        parse(editorText);
                        unmark_err(editorPath);
                        resolve([]);
                    } catch (err){
                        // console.log(err);
                        let iLine = err.line - 1
                        let iCol = err.column
                        let oLineRange = editor.getBuffer().rangeForRow(iLine, false)
                        let sMessage = err.message.match(/\[\d+:-*\d+] (.*)/)[1];
                        mark_err(editorPath);
                        resolve([new_lua_linter_msg(editorPath, iLine, iCol ,oLineRange, sMessage)]);
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

let unmark_err = (editorPath) => {
    $('.tree-view').find(`[data-path="${editorPath}"]`)
      .removeClass('lua-syntax-error-filename')
    $('.texteditor').find(`[data-path="${editorPath}"]`)
      .removeClass('lua-syntax-error-filename')
}

let mark_err = (editorPath) => {
    $('.tree-view').find(`[data-path="${editorPath}"]`)
      .addClass('lua-syntax-error-filename')
    $('.texteditor').find(`[data-path="${editorPath}"]`)
      .addClass('lua-syntax-error-filename')
}
