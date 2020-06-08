
import{Sentence}from "../../domain/sentence";
import{WordLine}from "../../domain/word-line";
import{FileSystemeUoW}from "../uow/fs-uow";
import{SqlLiteUoW}from "../uow/sql-lite-uow";
import{DataSettings} from"../setting";

import { Injectable } from '@angular/core';
import { resolve } from 'dns';
@Injectable({
    providedIn: 'root'
  })
export class SentenceRepository{
    constructor(public fsUow:FileSystemeUoW,public sqlLite:SqlLiteUoW,public settings:DataSettings) { }



    get(dbPath:string, skip?:number,take?:number):Promise<Sentence[]>{
        skip=skip||0;
        take=take||this.settings.PAGE_SIZE;
       return new Promise((resolve, reject)=> {
           if(this.fsUow.exists(dbPath)){
                this.sqlLite.open(dbPath).then(()=>{
                    let sql=` SELECT snt.*,count(*) over() as total  from sentences snt  order by creationDate DESC limit ${take} offset ${skip} `;
                    this.sqlLite.all(sql,[]).then((rows)=>{
                        let res=(rows||[]).map(item=>{
                                                let  ret=new Sentence();
                                                ret.id=item.id;
                                                ret.guid=item.guid;
                                                ret.documentId=item.documentId;
                                                ret.sentId=item.sentId;
                                                ret.newparid=item.newparid;
                                                ret.translit=item.translit;
                                                ret.sourcesentid=item.sourcesentid;
                                                ret.text=item.text;
                                                ret.total=item.total;
                                                ret.translations=item.translations;
                                                ret.creationDate=new Date(item.creationDate);
                                                ret.lastUpdateDate=new Date(item.lastUpdateDate);
                                                return ret;
                                            });
                        resolve(res);
                    })
                    .catch((er)=>reject(er))
                    .finally(()=>  this.sqlLite.close());
                }).catch((er)=>reject(er)) 
            }else{
                resolve([])
            }
        })

    }



    getIncludeLines(dbPath:string, skip?:number,take?:number):Promise<Sentence[]>{
        skip=skip||0;
        take=take||this.settings.PAGE_SIZE;
       return new Promise((resolve, reject)=> {
            this.sqlLite.open(dbPath).then(()=>{
                let sql=`SELECT * from 
                    (select id as sentenceid, guid as sentenceguid,documentId,sentId,newparid,translit,
                        sourcesentid,text,snt.creationDate as sentencecreationDate,snt.lastUpdateDate as sentencelastUpdateDate,
                         count(*) over() as sentstotal 
                         from sentences snt  order by creationDate DESC limit ${take} offset ${skip}
                         ) t1 LEFT OUTER JOIN wordlines wrd ON t1.sentenceguid=wrd.sentenceId
                 `;
                this.sqlLite.all(sql,[]).then((rows)=>{
                    let guids=[];
                    for(let row of rows||[]){
                        if(guids.findIndex(x=>x==row.sentenceguid)<0)guids.push(row.sentenceguid)
                    }
                   let sents= guids.map(guid=>{
                        let sentRows=(rows.filter(item=>item.sentenceguid==guid)||[])
                        let sent=sentRows[0]||{}
                        let ret=this.getRow(sent);
                        for(let rw of sentRows){
                            let wrd=new WordLine();
                            wrd.id=rw.id;
                            wrd.sentenceId=rw.sentenceId;
                            wrd.strIndex=rw.strIndex;
                            wrd.form=rw.form;
                            wrd.indx=rw.indx;
                            wrd.lemma=rw.lemma;
                            wrd.upostag=rw.upostag;
                            wrd.xpostag=rw.xpostag;
                            wrd.feats=rw.feats;
                            wrd.head=rw.head;
                            wrd.deprel=rw.deprel;
                            wrd.deps=rw.deps;
                            wrd.guid=rw.guid;
                            wrd.creationDate=new Date(rw.creationDate);
                            wrd.lastUpdateDate=new Date(rw.lastUpdateDate);
                            ret.lines.push(wrd);
                        }
                        return ret;
                    })
                    sents=sents.sort((left,right)=>{return left.creationDate > right.creationDate ? -1 : (right.creationDate > left.creationDate) ? 1 : 0 ;})
                    resolve(sents);
                })
                .catch((er)=>reject(er))
                .finally(()=>  this.sqlLite.close());
            })
        });
    }


    getRow(row:any):Sentence{
        let ret=new Sentence();
        ret.id=row.sentenceid;
        ret.guid=row.sentenceguid;
        ret.documentId=row.sentencedocumentId;
        ret.sentId=row.sentId;
        ret.newparid=row.newparid;
        ret.translit=row.translit;
        ret.sourcesentid=row.sourcesentid;
        ret.text=row.text;
        ret.total=row.sentstotal;
        ret.translations=row.translations;
        ret.creationDate=new Date(row.sentencecreationDate);
        ret.lastUpdateDate=new Date(row.sentencelastUpdateDate);
        ret.lines=[];
        return ret;
    }


    getById(guid:number,dbPath:string):Promise<Sentence>{
        return new Promise((resolve, reject)=> {
            this.sqlLite.open(dbPath).then(()=>{
                let sql=`select snt.*, count(*) over() as total from sentences snt  where guid=? `;
                this.sqlLite.getFirstOrDefalut(sql,guid).then((item)=>{
                    let ret=null;
                    if(item){
                        ret=new Sentence();
                        ret.id=item.id;
                        ret.guid=item.guid;
                        ret.documentId=item.documentId;
                        ret.sentId=item.sentId;
                        ret.newparid=item.newparid;
                        ret.translit=item.translit;
                        ret.sourcesentid=item.sourcesentid;
                        ret.text=item.text;
                        ret.total=item.total;
                        ret.translations=item.translations;
                        ret.creationDate=new Date(item.creationDate);
                        ret.lastUpdateDate=new Date(item.lastUpdateDate);
                    }
                    resolve(ret);
                })
                .catch((er)=>reject(er)) 
                .finally(()=>  this.sqlLite.close());
            })
        });
    }


    getLastSentence(dbPath:string):Promise<Sentence>{
        return new Promise((resolve, reject)=> {
            if(this.fsUow.exists(dbPath)){
                this.sqlLite.openCreate(this.sqlLite.createSentenceTable(),dbPath).then(()=>{
                    let sql=`select snt.*, count(*) over() as total from sentences snt  order by creationdate desc limit 1 `;
                    this.sqlLite.getFirstOrDefalut(sql,[]).then((item)=>{
                        let ret=null;
                        if(item){
                            ret=new Sentence();
                            ret.id=item.id;
                            ret.guid=item.guid;
                            ret.documentId=item.documentId;
                            ret.sentId=item.sentId;
                            ret.newparid=item.newparid;
                            ret.translit=item.translit;
                            ret.sourcesentid=item.sourcesentid;
                            ret.text=item.text;
                            ret.total=item.total;
                            ret.translations=item.translations;
                            ret.creationDate=new Date(item.creationDate);
                            ret.lastUpdateDate=new Date(item.lastUpdateDate);
                        }
                        resolve(ret);
                    })
                    .catch((er)=>reject(er)) 
                    .finally(()=>  this.sqlLite.close());
                })
            }else{
                resolve(undefined)
            }
        });
    }

    create(sent:Sentence,dbpath:string):Promise<Sentence>{
        sent.guid=this.sqlLite.getGuid();
        return new Promise( async (resolve, reject)=> {
            try{
                await this.sqlLite.openCreate(this.sqlLite.createSentenceTable(),dbpath)
                let sql=this.sqlLite.getInsertSql(sent,"sentences",["rootForm","id"]);
                await this.sqlLite.run(sql,[]);
                resolve(sent);
            }catch(er){
                reject(er)
            }finally {
               await this.sqlLite.close();
            }
        });
    }
    async  run(sent:Sentence,dbpath:string):Promise<Sentence>{
        sent.guid=this.sqlLite.getGuid();
        return new Promise( async (resolve, reject)=> {
            try{
                let sql=this.sqlLite.getInsertSql(sent,"sentences",["rootForm","id"]);
                await this.sqlLite.run(sql,[]);
                let words=[];
                for(let wrd of sent.lines){
                    wrd.sentenceId=sent.guid;
                    words.push(wrd);
                }
                while(words.length){
                        let batch=(words||[]).splice(0,10);
                        let sql=this.sqlLite.getInsertManySql(batch,"wordlines",["rootForm","id"]);
                        await this.sqlLite.run(sql,[])
                    }
                resolve(sent);
            }catch(er){
                reject(er)
            }
        });
    }

    async  runRange(sents:Sentence[],dbpath:string):Promise<Sentence[]>{
        sents=(sents||[] ).map(sent=>{ sent.guid=this.sqlLite.getGuid();return sent});
        return new Promise( async (resolve, reject)=> {
            try{
                let words=[];
                for(let sent of sents){
                    for(let wrd of sent.lines){
                        wrd.sentenceId=sent.guid;
                        words.push(wrd); 
                    }
                }
                let ary=(sents||[] )
                while(ary.length){
                    let batch=(ary||[]).splice(0,1000);
                    let sql=this.sqlLite.getInsertManySql(batch,"sentences",["rootForm","id"]);
                    await this.sqlLite.run(sql,[]);
                }
                while(words.length){
                        let batch=(words||[]).splice(0,2000);
                        let sql=this.sqlLite.getInsertManySql(batch,"wordlines",["rootForm","id"]);
                        await this.sqlLite.run(sql,[])
                    }
                let sql= "update wordlines set guid=id where guid is null"
                await this.sqlLite.run(sql,[])
                resolve(sents);
            }catch(er){
                reject(er)
            }
        });
    }





    createRange(sents:Sentence[],dbpath:string):Promise<Sentence[]>{
        sents.forEach(sent=>sent.guid=this.sqlLite.getGuid());
        return new Promise((resolve, reject)=> {
            this.sqlLite.openCreate(this.sqlLite.createSentenceTable(),dbpath).then(()=>{
                if(sents&&sents.length){
                    let copy=[]
                    this.sqlLite.butchRun(sents,"sentences",["rootForm","id"],copy,resolve,reject).then((res)=>{
                        resolve(res);
                    }) .catch((er)=>reject(er)).finally(()=>  this.sqlLite.close());
                 }else{
                    this.sqlLite.close().then(()=>resolve(sents));
                 }
            })
        });
    }


    update(sent:Sentence,dbpath:string):Promise<Sentence>{
        return new Promise((resolve, reject)=> {
            this.sqlLite.open(dbpath).then(()=>{

                let sql="UPDATE  sentences SET ";
                let params=[],names=[];
                let excludes=["rootForm","id","creationDate","documentId","guid"]
                for(let p in sent){
                    let pval=sent[p]
                    if(pval&&(/number|string/gi.test(typeof pval)|| pval.getTime) ){
                        if(excludes.findIndex(x=>new RegExp(x,"gi").test(p))<0){
                            let val=pval.getTime?pval.getTime():pval;
                            params.push(val);
                            names.push(p+"=?");
                        }
                    }
                }
                params.push(sent.id);
                sql+=names.join(',');
                sql+=" where id=? ";
                this.sqlLite.run(sql,params).then((row)=>{
                    resolve(sent);
                })
                .catch((er)=>reject(er)) 
                .finally(()=>  this.sqlLite.close());
            })
        });
    }

    delete(sent:Sentence,dbpath:string){
        return new Promise((resolve, reject)=> {
            this.sqlLite.open(dbpath).then(()=>{
                let sql=` DELETE FROM wordlines where sentenceid=${+sent.guid} `;
                this.sqlLite.run(sql,[]).then((row)=>{
                    setTimeout(() => {
                        sql=` DELETE FROM  sentences  where guid=${+sent.guid} `;
                        this.sqlLite.run(sql,[]).then((rowx)=>{
                            resolve(true);
                        }).catch((er)=>reject(er)) .finally(()=>  this.sqlLite.close());
                    }, 10);
                })
                .catch((er)=>{reject(er);this.sqlLite.close()}) 
                
            })
        });
    }





    segmentSentnce(modelPath:string,text:string){
        let options=["parse","model="+modelPath,"text="+text]
        let exePath=this.fsUow.getExePath();
        let ls=this.fsUow.spawnProc(exePath,options);
        return ls;
    }








    getDbPath(langName:string,docName:string):string{
        return this.fsUow.getPath([langName,docName+".db"]);
    }

    getCounts(dbPath:string):Promise<any>{
        return new Promise((resolve, reject)=> {
            if(this.fsUow.exists(dbPath)){
                this.sqlLite.open(dbPath).then(()=>{
                    let sql=` SELECT documentId ,totalSentences,totalWords,totalLemmas,totalUpostags from 
                            (
                                select documentId, guid as sentenceguid, (count(*) over()) as totalSentences from sentences snt
                            ) t1 
                            LEFT OUTER JOIN 
                            (
                                select sentenceId,
                                (SELECT count(distinct form ) from  wordlines)as totalWords,
                                (SELECT count(distinct lemma ) from  wordlines)as totalLemmas , 
                                (SELECT count(distinct upostag ) from  wordlines)as totalUpostags 
                                from wordlines 
                            )wrd 
                        
                            ON t1.sentenceguid=wrd.sentenceId
                                order by totalSentences desc ,totalWords desc,totalLemmas desc
                                limit 1`;
                    this.sqlLite.getFirstOrDefalut(sql,[]).then((item)=>{
                        resolve(item);
                    })
                    .catch((er)=>reject(er)) 
                    .finally(()=>  this.sqlLite.close());
                })
            } else{
                resolve({});
            } 

        })
    }

  close():Promise<any>{
     return this.sqlLite.close();
  }
 async  opencreate(path:string):Promise<any>{
       let sql=this.sqlLite.createSentenceTable();
        await this.sqlLite.openCreate(sql,path);
        sql=this.sqlLite.createWordTable();
      return  await this.sqlLite.run(sql,[]);
    }
     
}