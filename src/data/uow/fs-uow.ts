
// import * as fs from 'fs';
// import * as fsex from 'fs-extra';
// import * as path from 'path';
import{DataSettings} from"../setting";
import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
  })
export class FileSystemeUoW{
  fs:any;
  path:any;
    constructor(public settings:DataSettings) {
      this.fs=window.require("fs")
      this.path=window.require("path")
    }
    
    //path
    exists(path:string):boolean{
        return this.fs.existsSync(path);
      }

    getPath(paths:Array<string>):string{
       
        let strPath= this.path.join(__dirname, this.settings.conlludirPath);
        this.createDireIfNotExiste(strPath)
        for(let p of paths){
            strPath=this.path.join(strPath,p)
        }
        return strPath;
    }
    getExePath():string{
      let strPath= this.path.join(__dirname, this.settings.updpipeexePath);
      return strPath;
    }

    getFilesIndir(path:string,extenstion:string):string[]{
     let files= this.fs.readdirSync(path, {withFileTypes: true})
        .filter(item => !item.isDirectory()&&(extenstion?item.endsWith(extenstion):true))
       .map(item => item.name)
       return files;
    }

    //folders
    removeDire(srcPath:string){
        this._deleteFolderRecursive(srcPath);
      }
    
     
      createDireIfNotExiste(srcPath:string){
        this.fs.existsSync(srcPath) || this.fs.mkdirSync(srcPath);
      }
    
      moveDire(srcPath:string,destPath:string){
        let fsex = window.require('fs-extra');
          fsex.copySync(srcPath,destPath);
      }
    
      
      _deleteFolderRecursive(strpath) {
        let fsex = window.require('fs-extra');
        if (this.fs.existsSync(strpath)) {
          this.fs.readdirSync(strpath).forEach(  (file, index) => {
            const curPath = this.path.join(strpath, file);
            if (this.fs.lstatSync(curPath).isDirectory()) { // recurse
              this._deleteFolderRecursive(curPath);
            } else { // delete file
              fsex.removeSync(curPath);
            }
          });
          this.fs.rmdirSync(strpath);
        }
      };



      //file

      getFileNamewithOutExtension(strpath:string){
        return (strpath+"").split(/\/|\\/).pop().split(".").shift()
    
      }
      getFileName(strpath:string){
        return (strpath+"").split(/\/|\\/).pop();
      }
      copyFile(src:string,dest:string){
        this.fs.copyFileSync(src, dest);
      }
    
      getFileLines(strPath){
        let LineReaderSync = window.require("line-reader-sync");
        return new LineReaderSync(strPath);
      }
    
      getConlluFileNameWithExtension(fileName:string){
        return (fileName+"").endsWith(".conllu")?fileName:fileName+".conllu"
      }
      createFileIfNotExiste(strpath:string){
        if(!this.exists(strpath))
           this.fs.openSync(strpath, "a");
      }
    
     async removeFile(strpath:string){
        let fsex = window.require('fs-extra');
        return fsex.remove(strpath);
      }


      spawnProc(procname:string,option:string[]){
        if(!procname||!this.exists(procname)){
          throw new Error("Excproc not found "+procname);
        }
        option=option||[];
        const  spawn  = window.require('child_process');
        const ls = spawn.spawn(procname, option);
        return ls;
      }
      executeProc(procname:string,option:string[]){
          if(!procname||!this.exists(procname)){
            throw new Error("Excproc not found "+procname);
          }
          option=option||[];
          let strPath=this.getPath(["training.txt"])
          this.createFileIfNotExiste(strPath)
          const  spawn  = window.require('child_process');
          const ls = spawn.spawn(procname, option);
          ls.stdout.on( 'data', data => {
              console.log( `stdout: ${data}` );
          });
      
          ls.stderr.on( 'data', data => {
              console.error( `stderr: ${data}` );
          });
          ls.on( 'exit', code => {
            this.removeFile(strPath);
            console.log( `child process exited with code ${code}` );
          });
          ls.on( 'close', code => {
              console.log( `child process close with code ${code}` );
          });
      }
      isTraining(){
        let strPath=this.getPath(["training.txt"])
        return this.exists(strPath);
      }
    
}