
import { FileSystemeUoW } from '../uow/fs-uow';

import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
  })
export class FSDocumentRepository {

    constructor(public fsUow:FileSystemeUoW) {
    }

    exists(path:string):boolean{
        return this.fsUow.exists(path);
    }
    getPath(paths:Array<string>):string{
        return this.fsUow.getPath(paths);
    }
    
    getFileLines(strPath){
        let LineReaderSync = window.require("line-reader-sync");
        return new LineReaderSync(strPath);
      }
    documentExists(docName:string,langName:string):boolean{
        let filename=this.fsUow.getConlluFileNameWithExtension(docName);
        let strpath=this.fsUow.getPath([langName,filename]);
        return this.fsUow.exists(strpath);
    }
    createDocumentPath(docName:string,langName:string){
        let filename=this.fsUow.getConlluFileNameWithExtension(docName);
        let strpath=this.fsUow.getPath([langName,filename]);
        this.fsUow.createFileIfNotExiste(strpath);
    }

    deleteDocumentPath(docName:string,langName:string){
        let name=this.fsUow.getFileNamewithOutExtension(docName);
        let filename=this.fsUow.getConlluFileNameWithExtension(name);
        let strpath=this.fsUow.getPath([langName,filename]);
        this.fsUow.removeFile(strpath);
    }

    getDbPath(langName:string,docName?:string):string{
        docName=docName||langName;
        return this.fsUow.getPath([langName,docName+".db"]);
    }

    getFilePathWithouExt(docName:string,langName:string){
        let filename=this.fsUow.getFileNamewithOutExtension(docName);
        let strpath=this.fsUow.getPath([langName,filename]);
        return strpath;
    }
    copyDocument(srcPath:string,destPath:string,nocheck?:boolean){
        if(!this.fsUow.exists(srcPath))
            throw new Error(" File not found  :"+srcPath);
        
        if(!nocheck&&this.fsUow.exists(destPath))
                throw new Error(" Document already exists :"+destPath);
        this.fsUow.copyFile(srcPath,destPath);
        return destPath;
    }

    copyDocumentpath(langName:string,path:string):string{
        let sname=this.fsUow.getFileNamewithOutExtension(path);
        let filename=this.fsUow.getConlluFileNameWithExtension(sname);
        let strpath=this.fsUow.getPath([langName,filename]);
        if(!this.fsUow.exists(path))
            throw new Error(" File not found  :"+path);

        if(this.fsUow.exists(strpath))
                throw new Error(` Document (${sname}) already exists :`);
        this.fsUow.copyFile(path,strpath);
        return strpath;
    }

    removePath(strPath:string){
        if(!this.fsUow.exists(strPath))
            throw new Error(" File not found  :"+strPath);
        this.fsUow.removeFile(strPath);
    }

    
    getFileName(docName:string){
        return this.fsUow.getFileNamewithOutExtension(docName);
    }
    

    deleteDocumentDBpath(docName:string,langName:string){
        let fName=this.getFileName(docName);
        let filename= docName+".db";
        let strpath=this.fsUow.getPath([langName,filename]);
        this.fsUow.removeFile(strpath);
    }


    getLineByLine(path:string){
       return  this.fsUow.getFileLines(path);
    }
    
}