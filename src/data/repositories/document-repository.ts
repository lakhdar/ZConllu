
import{ConlluDocument}from "../../domain/conllu-document";
import{FileSystemeUoW}from "../uow/fs-uow";
import{SqlLiteUoW}from "../uow/sql-lite-uow";
import{DataSettings} from"../setting";

import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
  })
export class ConlluDocumentRepository{
    constructor(public fsUow:FileSystemeUoW,public sqlLite:SqlLiteUoW,public settings:DataSettings) { }


    get(dbPath?:string,skip?:number,take?:number):Promise<ConlluDocument[]>{
        skip=skip||0;
        take=take||this.settings.PAGE_SIZE;
       return new Promise((resolve, reject)=> {
        let createSql=this.sqlLite.createDocumentTable();
        this.sqlLite.openCreate(createSql,dbPath).then(()=>{
                let sql=`select * from documents order by creationDate DESC limit ? offset ? `;
                this.sqlLite.all(sql,[take,skip]).then((rows)=>{
                    let docs=(rows||[]).map(item=>{
                        let ret=new ConlluDocument();
                        ret.id=item.id;
                        ret.guid=item.guid;
                        ret.languageId=item.languageId;
                        ret.newdocId=item.newdocId;
                        ret.name=item.name;
                        ret.creationDate=new Date(item.creationDate);
                        ret.lastUpdateDate=new Date(item.lastUpdateDate);
                        return ret;
                    })
                    resolve(docs);
                })
                .catch((er)=>reject(er))
                .finally(()=>  this.sqlLite.close());
            })
        });
    }

    

    create(doc:ConlluDocument,dbPath?:string):Promise<ConlluDocument>{
        doc.guid=doc.guid||this.sqlLite.getGuid();
        return new Promise((resolve, reject)=> {
            let createSql=this.sqlLite.createDocumentTable();
            this.sqlLite.openCreate(createSql,dbPath).then(()=>{
                let sql=` INSERT INTO documents (guid,languageId, name, newdocId, creationDate, lastUpdateDate )  VALUES (?,?,?,?,?,? ) `;
                let params=[doc.guid, doc.languageId,doc.name, doc.newdocId||"",  doc.creationDate.getTime(), doc.lastUpdateDate.getTime()];
                this.sqlLite.run(sql,params).then(()=>{
                    resolve(doc);
                })
                .catch((er)=>reject(er)) 
                .finally(()=> {this.sqlLite.close();} );
            })
        });
    }

    update(doc:ConlluDocument,dbPath?:string):Promise<ConlluDocument>{
        return new Promise((resolve, reject)=> {
            this.sqlLite.open(dbPath).then(()=>{
                let sql=` UPDATE  documents SET  newdocId=? ,lastUpdateDate=?  `;
                let params=[doc.newdocId, doc.lastUpdateDate.getTime()];
                if(doc.languageId){
                    sql+=" ,languageId=? ";
                    params.push(doc.languageId);
                }
                sql+=" where id=?  "
                params.push(doc.id);
                console.log(params)
                this.sqlLite.run(sql,params).then((row)=>{
                    resolve(doc);
                })
                .catch((er)=>reject(er)) 
                .finally(()=>  this.sqlLite.close());
            })
        });
    }
   
    delete(guid:number,dbPath?:string){
        return new Promise((resolve, reject)=> {
            this.sqlLite.open(dbPath).then(()=>{
                let sql=` DELETE FROM  documents  where guid=?  `;
                let params=[guid];
                this.sqlLite.run(sql,params).then((row)=>{

                    resolve(true);
                })
                .catch((er)=>reject(er)) 
                .finally(()=>  this.sqlLite.close());
            })
        });
    }

   
    getById(guid:number,dbPath?:string):Promise<ConlluDocument>{
        return new Promise((resolve, reject)=> {
            this.sqlLite.open(dbPath).then(()=>{
                let sql=`select * from documents where guid=? `;
                this.sqlLite.getFirstOrDefalut(sql,guid).then((item)=>{
                    let ret=null;
                    if(item){
                        ret=new ConlluDocument();
                        ret.id=item.id;
                        ret.guid=item.guid;
                        ret.languageId=item.languageId;
                        ret.newdocId=item.newdocId;
                        ret.name=item.name;
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

    close(){
       return this.sqlLite.close();
    }
    getGuid(){
    return this.sqlLite.getGuid();
}
   
    
}