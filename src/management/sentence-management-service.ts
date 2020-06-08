import { Injectable } from '@angular/core';
import{SentenceRepository}from "../data/repositories/sentence-repoistory";
import{Sentence}from "../domain/sentence";
import{WordLine}from "../domain/word-line";


import{FSDocumentRepository}from "../data/repositories/fs-document-repository";
import { WordLineRepository } from '../data/repositories/word-line-repoistory';

@Injectable({
    providedIn: 'root'
  })

export class SentnceManagementService{
    constructor(public repository: SentenceRepository,
          public fsRepository:FSDocumentRepository,
          public wordRepository:WordLineRepository,
          
          ) {
     }

    get(langName:string,docName:string,skip?:number,take?:number):Promise<Sentence[]>{

        if(!langName)
            throw new Error("language name  is required");
        if(!docName)
            throw new Error("Document name  is required");
        let strPath= this.repository.getDbPath(langName,docName);
        return this.repository.get(strPath,skip,take);
    }

    getById(id:number,langName:string,docName:string):Promise<Sentence>{
        if(!id)
            throw new Error("Id is required");
        if(!langName)
            throw new Error("language name  is required");
        if(!docName)
            throw new Error("Document name  is required");

        let strPath= this.repository.getDbPath(langName,docName);
        return this.repository.getById(id,strPath);
    }

    create(sent:Sentence,langName:string,docName:string):Promise<any>{
        if(!sent||!sent.text||!sent.documentId)
            throw new Error("Sentence is required");
        if(!langName)
            throw new Error("language name  is required");
        if(!docName)
            throw new Error("Document name  is required");
        let strPath= this.repository.getDbPath(langName,docName);

        return new Promise((resolve, reject)=> {
            this.repository.getLastSentence(strPath).then(sentItem=>{
                let senId="sent_"+1
                if(sentItem){
                    senId=(sentItem.sentId+"").replace(/\d+$/,"");
                    senId+=(sentItem.id+1)+"";
                }
                sent.sentId=senId;
                setTimeout(() => {
                    this.repository.create(sent,strPath).then(res=>resolve(res)) .catch((er)=>reject(er)) ;
                }, 10);
            }) .catch((er)=>reject(er)) ;
        })
    }

    update(sent:Sentence,langName:string,docName:string):Promise<any>{
        if(!sent||!sent.text)
            throw new Error("Sentence is required");
        if(!langName)
            throw new Error("language name  is required");
        if(!docName)
            throw new Error("Document name  is required");
        let strPath= this.repository.getDbPath(langName,docName);
        sent.lastUpdateDate=new Date();
        return this.repository.update(sent,strPath);
    }

    delete(sent:Sentence,langName:string,docName:string):Promise<any>{
        if(!sent||!sent.id)
            throw new Error("document is required");
        if(!langName)
            throw new Error("language name  is required");
        if(!docName)
            throw new Error("Document name  is required");
        let strPath= this.repository.getDbPath(langName,docName);
        return this.repository.delete(sent,strPath);
    }

    segmentSentnce(sentguid:number,langName:string,docName:string,text:string){
        if(!langName)
          throw new Error("Language is required");
        if(!text)
          throw new Error("Text is required");

        let languageDirePath=this.fsRepository.getPath([langName]);
        if(!this.fsRepository.exists(languageDirePath))
            throw new Error("Language directory not found for: "+langName);
        let udpeFilePath=this.fsRepository.getPath([langName,"model.udpipe"]);
        if(this.fsRepository.exists(udpeFilePath)){
          let ls=this.repository.segmentSentnce(udpeFilePath,text);
            ls.stdout.on( 'data', (data) => {
                let splt=(data+"").split(/\r|\n/g);
               let lines=this.parseLines(sentguid,splt);
               if(lines&&lines.length){
                let strPath= this.repository.getDbPath(langName,docName);
                this.wordRepository.createRange(lines,strPath).catch(er=>console.log(er));
               }
            });

            ls.stderr.on( 'data', data => {
                console.error( `stderr: ${data}` );
            });
            // ls.on( 'exit', code => {
            //     console.log( `child process exited with code ${code}` );
            // });
            // ls.on( 'close', code => {
            //     console.log( `child process close with code ${code}` );
            // });

        }
        

      }

      parseLines(sentguid:number,lines:string[]):WordLine[]{
        let ret=[];
        let i=0;
        for(let line of lines){
            if(line&&!/^#/.test(line)){
                let tokens=line.split(/\t/);
                if(tokens.length>=10){
                    let word=new WordLine();
                    word.sentenceId=sentguid;
                    word.strIndex=tokens[0],
                    word.indx=++i,
                    word.form=tokens[1];
                    word.lemma=tokens[2];
                    word.misc=tokens[9];
                    let head=-1
                    let strHead=tokens[6];
                    if(strHead!="_")
                        head =+strHead;
                    if(head||head==0)word.head=head;
                    word.upostag=tokens[3];
                    word.xpostag=tokens[4];
                    word.feats=tokens[5];
                    word.deprel=tokens[7];
                    word.deps=tokens[8];
                    word.misc=tokens[9];
                    ret.push(word)
                }
                
            }
        }
        return ret;
      }
}