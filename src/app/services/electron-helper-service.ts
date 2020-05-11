import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ipcRenderer, webFrame, remote,BrowserWindow } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { AppSettingsService } from './app-settings-service';


 
@Injectable({
  providedIn: 'root'
})
export class ElectronHelperService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor(public settings :AppSettingsService) {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
    }
  }




  exists(path:string):boolean{
    return this.fs.existsSync(path);
  }

  getPath(paths:Array<string>):string{
    const path = window.require('path');
    let strPath= path.join(process.env.HOME, this.settings.conlludirPath);
    for(let p of paths){
      strPath=path.join(strPath,p)
    }
    return strPath;
  }

  //file
  getFileNamewithOutExtension(path:string){
    return (path+"").split(/\/|\\/).pop().split(".").shift()

  }
  getFileName(path:string){
    return (path+"").split(/\/|\\/).pop();
  }
  copyFile(src:string,dest:string){
    this.fs.copyFileSync(src, dest);
  }

  getFileLines(strPath){
    let LineReaderSync = window.require("line-reader-sync")
    return new LineReaderSync(strPath);
  }

  getConlluFileNameWithExtension(fileName:string){
    return (fileName+"").endsWith(".conllu")?fileName:fileName+".conllu"
  }
  createFileIfNotExiste(path:string){
    if(!this.exists(path))
      this.fs.openSync(path, "a");
  }

 async removeFile(path:string){
    let fsex = window.require('fs-extra');
    return fsex.remove(path);
  }



openfileDialog(text?:string,extension?:string){
  return  this.remote.dialog.showOpenDialog(null,{properties: ['openFile'],filters :[{name: text||'ConLl-u files', extensions: [extension||'conllu']}]});
 }

  

  //dir
  
  removeDire(path:string){
    this._deleteFolderRecursive(path);
  }

 
  createDireIfNotExiste(path:string){
    this.fs.existsSync(path) || this.fs.mkdirSync(path);
  }

  moveDire(srcPath:string,destPath:string){
    let fsex = window.require('fs-extra');
    fsex.copySync(srcPath,destPath);
  }

  readjson(path){
    let ret=null;
    if(this.fs.existsSync(path)){
      let str=this.fs.readFileSync(path, 'utf8') ;
      ret=JSON.parse(str);
    }
  return ret;
  }
  
  writejson(path,json){
    let str=JSON.stringify(json);
    this.fs.writeFileSync(path,str,{encoding:'utf8',flag:'w'})
  }
  _deleteFolderRecursive(strpath) {
    const path = window.require('path');
    const fsex = window.require('fs-extra');
    if (this.fs.existsSync(strpath)) {
      this.fs.readdirSync(strpath).forEach(  (file, index) => {
        const curPath = path.join(strpath, file);
        if (this.fs.lstatSync(curPath).isDirectory()) { // recurse
          this._deleteFolderRecursive(curPath);
        } else { // delete file
          fsex.removeSync(curPath);
        }
      });
      this.fs.rmdirSync(strpath);
    }
  };

}
