'use strict';
import * as vscode from 'vscode';


console.info("TEST pt 0");
export function activate(ctx: vscode.ExtensionContext): void {
    var selector = { language: 'qscript' } as vscode.DocumentSelector
    var meta = { label: 'qscript-provider' } as vscode.DocumentSymbolProviderMetadata
    
	console.info('TEST pt 1');
    ctx.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
           selector,
            new QScriptDocumentSymbolProvider(),
            meta));
    
	console.info("TEST pt 2");
}

class QScriptDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    
    public provideDocumentSymbols(document: vscode.TextDocument,
            token: vscode.CancellationToken): Thenable<vscode.DocumentSymbol[]> {
        return new Promise((resolve, reject) => {
         
            
            let symbols:vscode.DocumentSymbol[] = [];
            let stuff :vscode.TextLine[]= []
            let last_config_variable:any=null
            for (var i = 0; i < document.lineCount; i++)
            {

               let line:any= document.lineAt(i);
               stuff.push(line);
               let symbol_name:string | false = (line.b ?? line.text) ?? "default name"
                if(symbol_name == false){
                   continue
                }
                let symbol_string = symbol_name.replace("[","").replace("]","");
                if (symbol_string.endsWith("=\"")) {
                    var name__ = symbol_string.replaceAll("=\"","")
                    let symbol = new vscode.DocumentSymbol(
                                name__,
                                "Config Variable",
                                vscode.SymbolKind.Class,
                                line.range, line.range)
                    last_config_variable = symbol;
                    symbols.push(symbol)     
                }
                else if (symbol_name.startsWith("[")) 
                {                   
                    if(symbol_string.includes("\"") )
                    {                                        
                        let symbol = new vscode.DocumentSymbol(
                            symbol_string.replaceAll("\"",""),
                            "QS Marker",
                            vscode.SymbolKind.Array,
                            line.range, line.range)
                            if(last_config_variable != null){
                                last_config_variable.children.push(symbol)
                            }
                            else{
                                symbols.push(symbol)
                            }                           
                        }                    
                    else
                    {
                        let symbol = new vscode.DocumentSymbol(
                                symbol_string,
                                "QS Marker",
                                vscode.SymbolKind.Array,
                                line.range, line.range)
                                if(last_config_variable != null){
                                    last_config_variable.children.push(symbol)
                                }
                                else{
                                    symbols.push(symbol)
                                }
                    }
                }   
                else if (symbol_name.startsWith("go["))
                {
                    let symbol = new vscode.DocumentSymbol(
                        symbol_name.replaceAll("go[","").replaceAll("]",""),
                        "QS GO",
                        vscode.SymbolKind.Event,
                        line.range, line.range)
                    if(last_config_variable != null){
                        last_config_variable.children.push(symbol)
                    }
                    else{
                        symbols.push(symbol)
                    }        
                } 
                   else if (symbol_name.startsWith("choice[")||symbol_name.startsWith("choices["))
                {
                    let split_strings = symbol_name.replaceAll("choice[","").replaceAll("choices[","").split(",")
                    for(let split =0; split < split_strings.length;split++){

                        let symbol = new vscode.DocumentSymbol(
                            split_strings[split].replaceAll("]",""),
                            "QS CHOICE",
                            vscode.SymbolKind.Event,
                            line.range, line.range)
                        if(last_config_variable != null){
                            last_config_variable.children.push(symbol)
                        }
                        else{
                            symbols.push(symbol)
                        }        
                    }
                    
                } 
                 else if (symbol_name.startsWith("do["))
                {
                    let symbol = new vscode.DocumentSymbol(
                        symbol_name.replaceAll("do[","").replaceAll("]",""),
                        "QS DO",
                        vscode.SymbolKind.Field,
                        line.range, line.range)
                    if(last_config_variable != null){
                        last_config_variable.children.push(symbol)
                    }
                    else{
                        symbols.push(symbol)
                    }        
                }
                  else if (symbol_name.startsWith("if["))
                {
                    var split =  symbol_name.replaceAll("if[","").split("]")

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
                    if(last_config_variable != null){
                        last_config_variable.children.push(symbol_1)
                        last_config_variable.children.push(symbol_2)
                    }
                    else{
                        symbols.push(symbol_1)
                        symbols.push(symbol_2)
                    }        
                }
           }   
         resolve(symbols)
        });
    }
}
export function deactivate() {}