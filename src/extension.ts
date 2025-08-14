'use strict';
import * as vscode from 'vscode';

export function activate(ctx: vscode.ExtensionContext): void {
    var selector = { language: 'qscript' } as vscode.DocumentSelector
    var meta = { label: 'qscript-provider' } as vscode.DocumentSymbolProviderMetadata
    ctx.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            selector,
            new QScriptDocumentSymbolProvider(),
            meta));
}

class QScriptDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(document: vscode.TextDocument,
        token: vscode.CancellationToken): Thenable<vscode.DocumentSymbol[]> {
        return new Promise((resolve, reject) => {
            let symbols: vscode.DocumentSymbol[] = [];
            let stuff: vscode.TextLine[] = []
            let last_config_variable: any = null
            let last_region_variable: any = null
            for (var i = 0; i < document.lineCount; i++) {


                let line: any = document.lineAt(i);
                stuff.push(line);

                let symbol_name: string | false = (line.b ?? line.text) ?? "default name"
                if (symbol_name == false) {
                    continue
                }

                let symbol_string = symbol_name.replace("[", "").replace("]", "");

                var is_end_region_symbol = symbol_name.startsWith("region=\"end\"") ||
                    symbol_name.startsWith("REGION=\"END\"") ||
                    symbol_name.startsWith("region =\"end\"") ||
                    symbol_name.startsWith("REGION =\"END\"") ||
                    symbol_name.startsWith("region= \"end\"") ||
                    symbol_name.startsWith("REGION= \"END\"") ||
                    symbol_name.startsWith("region = \"end\"") ||
                    symbol_name.startsWith("REGION = \"END\"")

                var is_region_symbol = is_end_region_symbol == false && (symbol_name.startsWith("region") || symbol_name.startsWith("REGION"))

                if (is_region_symbol) {
                    var name__ = symbol_string.replaceAll("region", "").replaceAll("REGION", "").replaceAll("=", "").replaceAll("\"", "").replaceAll("\\", "")
                    let symbol = new vscode.DocumentSymbol(
                        name__,
                        "Region",
                        vscode.SymbolKind.File,
                        line.range, line.range)
                    last_region_variable = symbol;
                    symbols.push(symbol)
                }
                else if (is_end_region_symbol) {
                    last_region_variable = null
                }
                else if (symbol_string.endsWith("=\"") || symbol_string.endsWith("=\\\"")) {
                    var name__ = symbol_string.replaceAll("=\"", "").replaceAll("=\\\"", "")
                    let symbol = new vscode.DocumentSymbol(
                        name__,
                        "Config Variable",
                        vscode.SymbolKind.Class,
                        line.range, line.range)
                    last_config_variable = symbol;
                    if (last_region_variable == null) {
                        symbols.push(symbol)
                    }
                    else {
                        last_region_variable.children.push(symbol);
                    }
                }
                else if (symbol_name.startsWith("[")) {
                    if (symbol_string.includes("\"")) {
                        let symbol = new vscode.DocumentSymbol(
                            symbol_string.replaceAll("\"", ""),
                            "QS Marker",
                            vscode.SymbolKind.Array,
                            line.range, line.range)
                        if (last_config_variable != null) {
                            last_config_variable.children.push(symbol)
                        }
                        else {
                            if (last_region_variable == null) {
                                symbols.push(symbol)
                            }
                            else {
                                last_region_variable.children.push(symbol);
                            }
                        }
                    }
                    else {
                        let symbol = new vscode.DocumentSymbol(
                            symbol_string,
                            "QS Marker",
                            vscode.SymbolKind.Array,
                            line.range, line.range)
                        if (last_config_variable != null) {
                            last_config_variable.children.push(symbol)
                        }
                        else {
                            if (last_region_variable == null) {
                                symbols.push(symbol)
                            }
                            else {
                                last_region_variable.children.push(symbol);
                            }
                        }
                    }
                }
                else if (symbol_name.startsWith("go[")) {
                    let symbol = new vscode.DocumentSymbol(
                        symbol_name.replaceAll("go[", "").replaceAll("]", ""),
                        "QS GO",
                        vscode.SymbolKind.Event,
                        line.range, line.range)
                    if (last_config_variable != null) {
                        last_config_variable.children.push(symbol)
                    }
                    else {
                        if (last_region_variable == null) {
                            symbols.push(symbol)
                        }
                        else {
                            last_region_variable.children.push(symbol);
                        }
                    }
                }
                else if (symbol_name.startsWith("choice[") || symbol_name.startsWith("choices[")) {
                    let split_strings = symbol_name.replaceAll("choice[", "").replaceAll("choices[", "").split(",")
                    for (let split = 0; split < split_strings.length; split++) {

                        let symbol = new vscode.DocumentSymbol(
                            split_strings[split].replaceAll("]", ""),
                            "QS CHOICE",
                            vscode.SymbolKind.Event,
                            line.range, line.range)
                        if (last_config_variable != null) {
                            last_config_variable.children.push(symbol)
                        }
                        else {
                            if (last_region_variable == null) {
                                symbols.push(symbol)
                            }
                            else {
                                last_region_variable.children.push(symbol);
                            }
                        }
                    }
                }
                else if (symbol_name.startsWith("do[")) {
                    let symbol = new vscode.DocumentSymbol(
                        symbol_name.replaceAll("do[", "").replaceAll("]", ""),
                        "QS DO",
                        vscode.SymbolKind.Field,
                        line.range, line.range)
                    if (last_config_variable != null) {
                        last_config_variable.children.push(symbol)
                    }
                    else {
                        if (last_region_variable == null) {
                            symbols.push(symbol)
                        }
                        else {
                            last_region_variable.children.push(symbol);
                        }
                    }
                }
                else if (symbol_name.startsWith("if[")) {
                    var split = symbol_name.replaceAll("if[", "").split("]")

                    let symbol_1 = new vscode.DocumentSymbol(
                        split[0],
                        "QS IF PREDICATE",
                        vscode.SymbolKind.Boolean,
                        line.range, line.range)
                    let symbol_2 = new vscode.DocumentSymbol(
                        split[1],
                        "QS IF Function",
                        vscode.SymbolKind.Function,
                        line.range, line.range)
                    if (last_config_variable != null) {
                        last_config_variable.children.push(symbol_1)
                        last_config_variable.children.push(symbol_2)
                    }
                    else {
                        if (last_region_variable == null) {
                            symbols.push(symbol_1)
                            symbols.push(symbol_2)
                        }
                        else {
                            last_region_variable.children.push(symbol_1);
                            last_region_variable.children.push(symbol_2);
                        }
                    }
                }
            }
            resolve(symbols)
        });
    }
}
export function deactivate() { }