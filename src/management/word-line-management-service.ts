import { Injectable } from '@angular/core';
import{WordLineRepository}from "../data/repositories/word-line-repoistory";
import{WordLine,EmptyNodeLine,MultiwordTokenLine}from "../domain/word-line";

@Injectable({
    providedIn: 'root'
  })

export class WordLineManagementService{
    constructor(public repository: WordLineRepository) {
     }

    get(sentId:number,langName:string,docName:string,skip?:number,take?:number):Promise<any[]>{

        if(!langName)
            throw new Error("language name  is required");
        if(!docName)
            throw new Error("Document name  is required");
        let strPath= this.repository.getDbPath(langName,docName);
        return this.repository.get(sentId,strPath,skip,take);
    }

    getById(id:number,langName:string,docName:string):Promise<any>{
        if(!id)
            throw new Error("Id is required");
        if(!langName)
            throw new Error("language name  is required");
        if(!docName)
            throw new Error("Document name  is required");

        let strPath= this.repository.getDbPath(langName,docName);
        return this.repository.getById(id,strPath);
    }

    create(sent:WordLine,langName:string,docName:string):Promise<WordLine>{

        if(!sent||!sent.sentenceId)
            throw new Error("Sentence is required");
        if(!langName)
            throw new Error("language name  is required");
        if(!docName)
            throw new Error("Document name  is required");
        let strPath= this.repository.getDbPath(langName,docName);
        return this.repository.create(sent,strPath);
    }

    update(sent:WordLine,langName:string,docName:string):Promise<WordLine>{
        if(!sent)
            throw new Error("Sentence is required");
        if(!langName)
            throw new Error("language name  is required");
        if(!docName)
            throw new Error("Document name  is required");
        let strPath= this.repository.getDbPath(langName,docName);
        sent.lastUpdateDate=new Date();
        return this.repository.update(sent,strPath);
    }

    updateRange(lines:WordLine[],langName:string,docName:string):Promise<WordLine[]>{
        if(!lines||!lines.length)
            throw new Error("lines are required");
        if(!langName)
            throw new Error("language name  is required");
        if(!docName)
            throw new Error("Document name  is required");
        let strPath= this.repository.getDbPath(langName,docName);
        for(let ln of lines){
            ln.lastUpdateDate=new Date();
        }
        return  this.repository.updateRange(lines,strPath);
    }

    delete(word:WordLine,langName:string,docName:string):Promise<WordLine>{
        if(!word||!word.guid)
            throw new Error("document is required"+word);
        if(!langName)
            throw new Error("language name  is required");
        if(!docName)
            throw new Error("Document name  is required");
        let strPath= this.repository.getDbPath(langName,docName);
        return this.repository.delete(word,strPath);
    }
}