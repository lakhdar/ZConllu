import { Injectable } from '@angular/core';
import{ConlluDocumentRepository}from "../data/repositories/document-repository";
import{ConlluDocument}from "../domain/conllu-document";
import{ConlluBlockReaderRepository}from "../data/repositories/conllu-block-repository";
import{SentenceRepository}from "../data/repositories/sentence-repoistory";
import{WordLineRepository}from "../data/repositories/word-line-repoistory";
import{FSDocumentRepository}from "../data/repositories/fs-document-repository";
import{DataSettings} from"../data/setting";
import { LanguageRepository } from '../data/repositories/language-repoistory';
import { Language } from 'src/domain/language';
import { Sentence } from 'src/domain/sentence';
import { WordLine } from 'src/domain/word-line';



@Injectable({
    providedIn: 'root'
  })

export class DocumentManagementService{
    constructor(public repository: ConlluDocumentRepository,
        public conlluReader:ConlluBlockReaderRepository,
        public sentenceRepository:SentenceRepository,
        public lineRepository:WordLineRepository,
        public langRepository:LanguageRepository,
        public fsRepository:FSDocumentRepository,
        public settings:DataSettings) {
     }

    get(langName:string,skip?:number,take?:number):Promise<ConlluDocument[]>{
       let strPath= this.fsRepository.getDbPath(langName);
      return  this.repository.get(strPath,skip,take)
    }

    getById(guid:number,langName:string):Promise<ConlluDocument>{
        if(!guid)
            throw new Error("guid is required");
        if(!langName)
            throw new Error("language name  is required");
        return new Promise((resolve, reject)=> {
            let strPath= this.fsRepository.getDbPath(langName);
            this.repository.getById(guid,strPath).then(doc=>{
                setTimeout(() => {
                    let sentDBPath=this.sentenceRepository.getDbPath(langName,doc.name);
                    this.sentenceRepository.get(sentDBPath).then(sents=>{
                        doc.sentences=sents||[];
                        doc.totalSentences=+((sents||[]) [0]||{}).total;
                        resolve(doc);
                    }).catch(er=>reject(er))
                }, 20);
            }).catch(er=>reject(er))
        });
    }

    getCount(doc:ConlluDocument,langName:string):Promise<ConlluDocument>{
        return new Promise((resolve, reject)=> {
            let sentDBPath=this.sentenceRepository.getDbPath(langName,doc.name);
            this.sentenceRepository.getCounts(sentDBPath).then( (counts)=>{
                doc.totalSentences=(counts||{}).totalSentences;
                doc.totalLemmas=(counts||{}).totalLemmas;
                doc.totalWords=(counts||{}).totalWords;
                doc.totalUpostags=(counts||{}).totalUpostags;
                resolve(doc)
            }).catch(er=>reject(er)); 
        });
    }

    getCounts(docs:ConlluDocument[],langName:string,index:number,copy:any[],resolver?:any,rejecter?:any):Promise<ConlluDocument[]>{
        return new Promise((resolve, reject)=> {
            index=index||0;
            copy=copy||[];
            if(index<docs.length){
                let doc=docs[index];
                index++;
                this.getCount (doc,langName).then((doc)=>{
                    copy.push(doc);
                    setTimeout(() => {
                     this.getCounts(docs,langName,index,copy,resolver||resolve,rejecter||reject)
                    }, 5);
                }).catch(er=>{(rejecter||reject)(er);});
            }else{
                (resolver||resolve)(copy)
            }
        });
    }

    create(doc:ConlluDocument,langName:string):Promise<ConlluDocument>{
      
        if(!doc||!doc.name||!doc.languageId)
            throw new Error("Document is required");
        if(!langName)
            throw new Error("Language name  is required");
        if(this.fsRepository.documentExists(doc.name,langName))
            throw new Error(`Document ${doc.name} already exists`);
        //this.fsRepository.createDocumentPath(doc.name,langName);

        let strPath= this.fsRepository.getDbPath(langName);
        return  this.repository.create(doc,strPath)
    }

    update(doc:ConlluDocument,langName:string):Promise<any>{
        if(!doc||!doc.id)
            throw new Error("document is required");
        if(!langName)
            throw new Error("language name  is required");
            let strPath= this.fsRepository.getDbPath(langName);
            doc.lastUpdateDate=new Date();
        return this.repository.update(doc,strPath);
    }

    delete(doc:ConlluDocument,langName:string):Promise<any>{
        if(!doc||!doc.name||!doc.id)
            throw new Error("document is required");
        if(!langName)
            throw new Error("language name  is required");
        this.fsRepository.deleteDocumentPath(doc.name,langName);
        let strPath= this.fsRepository.getDbPath(langName);
        return new Promise((resolve, reject)=> {
            this.repository.delete(doc.guid,strPath).then(()=>{
                this.fsRepository.deleteDocumentDBpath(doc.name,langName);
                resolve(true);
            }).catch((er)=>reject(er)) ;
         });
    }


    importConlluFileStream(path:string,langGuid:number, langName:string):Promise<ConlluDocument>{
        
        return new Promise(async (resolve, reject)=> {
                let document=new ConlluDocument();
                document.guid=this.repository.getGuid() ;

                try{
                    let strpath= this.fsRepository.copyDocumentpath(langName,path);
                    document= this.conlluReader.parseFile(document,strpath,this.settings.CONLLU_V2);

                    document.languageId=langGuid ;
                    document.name=this.fsRepository.getFileName(path);

                    let dbPath=this.sentenceRepository.getDbPath(langName,document.name);
                    await this.sentenceRepository.opencreate(dbPath);
                    await this.sentenceRepository.runRange(document.sentences,dbPath);
                    await this.sentenceRepository.close();
                    let docDbPath= this.fsRepository.getDbPath(langName);
                    await this.repository.create(document,docDbPath);

                }catch(er){
                    this.fsRepository.deleteDocumentPath(path,langName);
                    throw reject(er);
                }

                resolve(document)
        });
    }




    
    moveConlluFile(doc:ConlluDocument,srcLangName:string, destLangName:string,destLangGuid:number):Promise<ConlluDocument>{
        let guid=doc.guid;
        return new Promise((resolve, reject)=> {
            try{
                let srcPath=this.fsRepository.getFilePathWithouExt(doc.name,srcLangName);
                let destPath=this.fsRepository.getFilePathWithouExt(doc.name,destLangName);
                let srcFilepath=srcPath+".conllu";
                let srcDBFilepath=srcPath+".db";
                let destFilepath=destPath+".conllu";
                let destDBFilepath=destPath+".db";
                this.fsRepository.copyDocument(srcFilepath,destFilepath);
                this.fsRepository.copyDocument(srcDBFilepath,destDBFilepath);
                 
                doc.languageId=destLangGuid
                this.create(doc,destLangName).then(()=>{
                    setTimeout(() => {
                        doc.guid=guid;
                     this.delete(doc,srcLangName).then(()=>{
                        resolve(doc) ;
                     }).catch(er=>reject(er));
                    }, 12);
                }).catch(er=>reject(er)); 
            }catch(er){reject(er)}
        })
    }

    importUDpipeFile(udpipePath:string,lang:Language):Promise<Language>{
        return new Promise((resolve, reject)=> {
            try{
                let destPath=this.fsRepository.getFilePathWithouExt(udpipePath,lang.name);
                let destFilepath=destPath+".udpipe";
                this.fsRepository.copyDocument(udpipePath,destFilepath,true);
                let name=this.fsRepository.getFileName(udpipePath);
                lang.udpFile=name;
                this.langRepository.update(lang).then((res)=>resolve(res)).catch(er=>reject(er));
            }catch(er){reject(er)}
        })
    }
    
  importeTextFile(filepath:string,langName:string,docName:string,documntguid:number):Promise<any>{

        let readlines=this.fsRepository.getFileLines(filepath);
        let line="true"
        let strPath= this.fsRepository.getDbPath(langName,docName);
        let strModelPath= this.fsRepository.getPath([langName,"model.udpipe"]);
        let i=1;
        let blocks=[]
        while(line){
            line=readlines.readline();
            let strline=line?line.trim().replace(/\n|\r/g,""):undefined
            if(strline){
                let sent=new Sentence();
                sent.sentId="sent_"+i;
                sent.text=strline;
                sent.documentId=documntguid;
                blocks.push(sent);
                i++;
                if (i%100==0) console.log(" i=",i);
                if (i>1000) break;
            }
        }
        console.log("text read")
       return  this.segmetBloks(blocks,strModelPath,strPath); 
    }

createSentence(sentence:Sentence, doc:ConlluDocument,langName:string):Promise<Sentence>{
    return new Promise(async(resolve, reject)=> {
        sentence.documentId=doc.guid;
        try{
            let dbPath=this.sentenceRepository.getDbPath(langName,doc.name);
            let  retSent=  await this.sentenceRepository.run(sentence,dbPath)
             resolve(retSent)
        }catch(er){
            reject(er)
        }
        
    });
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

async segmetBloks(blocks:any[],strModelPath:string,dbtPath:string,arr?:any[]){
      if(blocks.length){;
            arr=arr||[];
            let sent=blocks.shift();
            let ls= this.sentenceRepository.segmentSentnce(strModelPath,sent.text);
            ls.stderr.on( 'data', (data) => { console.log("data err,",data+"")});
            ls.stdout.on( 'data', (data) => {
                    let splt=(data+"").split(/\r|\n/g);
                    let lines=this.parseLines(sent.guid,splt);
                    if(lines&&lines.length){
                        sent.lines=lines;
                    }
                    arr.push(sent)
                    if (blocks.length%10==0) console.log(" blocks.length=",blocks.length);
                    this.segmetBloks(blocks,strModelPath,dbtPath,arr);
            });
        }else{
            console.log("saveSentences",arr.length)
           await this.saveSentences(arr,dbtPath);
           console.log("return arr;",arr.length)
            return arr;
        }
  }

saveSentences(block:Sentence[],strbdPath:string):Promise<any>{
    return new Promise(async(resolve, reject)=> {
      this.sentenceRepository.opencreate(strbdPath).then(()=>{
        this.sentenceRepository.runRange(block,strbdPath).then((dt)=>{
            console.log("donccccccccccccccccccccccccce")
            resolve(dt);
            
        }).catch(er=>reject(er))
        .finally(()=>this.sentenceRepository.close())
      }).catch(er=>{this.sentenceRepository.close();reject(er)})
    });
}


}