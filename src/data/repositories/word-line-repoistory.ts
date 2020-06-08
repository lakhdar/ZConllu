
import{FileSystemeUoW}from "../uow/fs-uow";
import{SqlLiteUoW}from "../uow/sql-lite-uow";
import{DataSettings} from"../setting";
import{WordLine} from"../../domain/word-line";

import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
  })
export class WordLineRepository{
    constructor(public fsUow:FileSystemeUoW,public sqlLite:SqlLiteUoW,public settings:DataSettings) { }


    get(sentId:number,dbPath:string, skip?:number,take?:number):Promise<WordLine[]>{
        skip=skip||0;
        take=take||this.settings.PAGE_SIZE;
       return new Promise((resolve, reject)=> {

            this.sqlLite.openCreate(this.sqlLite.createWordTable(),dbPath).then(()=>{
                let sql=`select * from wordlines where sentenceId=? order by indx limit ? offset ? `;
                this.sqlLite.all(sql,[sentId,take,skip]).then((rows)=>{
                                 let res=(rows||[]).map(rw=>{
                                        let  wrd=new WordLine();
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
                                        wrd.misc=rw.misc;
                                        wrd.creationDate=new Date(rw.creationDate);
                                        wrd.lastUpdateDate=new Date(rw.lastUpdateDate);
                                        return wrd;
                                    });
                        resolve(res);
                })
                .catch((er)=>reject(er))
                .finally(()=>  this.sqlLite.close());
            })
        });
    }

    getById(guid:number,dbPath:string):Promise<any>{
        return new Promise((resolve, reject)=> {
            this.sqlLite.open(dbPath).then(()=>{
                let sql=`select * from wordlines where guid=? `;
                this.sqlLite.getFirstOrDefalut(sql,guid).then((row)=>{
                    if(row){
                        for( let p in row){
                            if(/date/gi.test(p)){
                                row[p] =new Date( row[p]) 
                            }
                        }
                    }
                    resolve(row);
                })
                .catch((er)=>reject(er)) 
                .finally(()=>  this.sqlLite.close());
            })
        });
    }

    create(sent:WordLine,dbpath:string):Promise<WordLine>{
        
        sent.guid=this.sqlLite.getGuid();
        return new Promise((resolve, reject)=> {
            this.sqlLite.openCreate(this.sqlLite.createWordTable(),dbpath).then(()=>{
                if(sent){
                let sql=this.sqlLite.getInsertSql(sent,"wordlines",["rootForm","id"]);
                    this.sqlLite.run(sql,[]).then(()=>{
                        resolve(sent);
                    }) .catch((er)=>reject(er)) .finally(()=>  this.sqlLite.close());
                }else{
                    this.sqlLite.close().then(()=>resolve(sent));
                }
            });
        });
    }
   async createRange(words:WordLine[],dbpath:string):Promise<WordLine[]>{
        words.forEach(sent=>sent.guid=this.sqlLite.getGuid());
        return new Promise(async (resolve, reject)=> {
            try{ 
                await this.sqlLite.openCreate(this.sqlLite.createWordTable(),dbpath)
                let ary=(words||[])
                while(ary.length){
                        let batch=(ary||[]).splice(0,10);
                        let sql=this.sqlLite.getInsertManySql(batch,"wordlines",["rootForm","id"]);
                        await this.sqlLite.run(sql,[])
                    }
                resolve(words)
            }catch(er){reject(er)}
            finally {
                await this.sqlLite.close();
            }
        });
    }
    update(sent:WordLine,dbpath:string):Promise<WordLine>{
        return new Promise((resolve, reject)=> {
            this.sqlLite.open(dbpath).then(()=>{
                let excludes=["id","creationDate","sentenceId","guid",]
                let sql="UPDATE  wordlines SET ";
                let params=[],names=[];
                for(let p in sent){
                    let pval=sent[p]
                    if((/number|string/gi.test(typeof pval)|| pval.getTime) ){
                        if(excludes.findIndex(x=>new RegExp("^"+x+"$","gi").test(p))<0){
                            let val=pval.getTime?pval.getTime():pval;
                            params.push(val);
                            names.push(p+"=?");
                        }
                    }
                }
                params.push(sent.guid);
                sql+=names.join(',');
                sql+=" where guid=? ";
                this.sqlLite.run(sql,params).then((row)=>{
                    resolve(sent);
                })
                .catch((er)=>reject(er)) 
                .finally(()=>  this.sqlLite.close());
            })
        });
    }


    updateRange(lines:WordLine[],dbpath:string):Promise<WordLine[]>{
        return new Promise( (resolve, reject)=> {
            this.sqlLite.open(dbpath).then( async ()=>{
                let excludes=["id","creationDate","sentenceId","guid",]
                

                for(let sent of lines){
                    let params=[],names=[];
                    let sql="UPDATE  wordlines SET ";

                    for(let p in sent){
                        let pval=sent[p]
                        if((/number|string/gi.test(typeof pval)|| pval.getTime) ){
                            if(excludes.findIndex(x=>new RegExp("^"+x+"$","gi").test(p))<0){
                                let val=pval.getTime?pval.getTime():pval;
                                params.push(val);
                                names.push(p+"=?");
                            }
                        }
                    }
                    params.push(sent.guid);
                    sql+=names.join(',');
                    sql+=" where guid=? ";
                    try{
                         await this.sqlLite.run(sql,params)
                     }catch(er){
                         reject(er);
                    }
                     
                }
                await this.sqlLite.close();
                resolve(lines)
            })
            
        });
    }

    delete(sent:any,dbpath:string):Promise<any>{
        return new Promise((resolve, reject)=> {
            this.sqlLite.open(dbpath).then(()=>{
                let sql=` DELETE FROM  wordlines  where guid=?  `;
                let params=[sent.guid];
                this.sqlLite.run(sql,params).then((row)=>{
                    resolve(true);
                })
                .catch((er)=>reject(er)) 
                .finally(()=>  this.sqlLite.close());
            })
        });
    }

    getDbPath(langName:string,docName:string):string{
        return this.fsUow.getPath([langName,docName+".db"]);
    }
    
    

}