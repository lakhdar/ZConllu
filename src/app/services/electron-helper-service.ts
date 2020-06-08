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
    }
  }


openfileDialog(text?:string,extension?:string){
  return  this.remote.dialog.showOpenDialog(null,{properties: ['openFile'],filters :[{name: text||'ConLl-u files', extensions: [extension||'conllu']}]});
 }

  

   
}
