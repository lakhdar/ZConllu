
import{Language}from "../../domain/language";
import{FileSystemeUoW}from "../uow/fs-uow";
import{SqlLiteUoW}from "../uow/sql-lite-uow";
import{DataSettings} from"../setting";
import{TrainArgs}from "../../domain/train-args";
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class LanguageRepository{
    constructor(public fsUow:FileSystemeUoW,public sqlLite:SqlLiteUoW,public settings:DataSettings) { }


    get(skip?:number,take?:number):Promise<Language[]>{
        skip=skip||0;
        take=take||this.settings.PAGE_SIZE;

       return new Promise((resolve, reject)=> {
            this.sqlLite.open().then(()=>{
                let sql=`select * from languages  ORDER BY creationDate   limit ? offset ? `;
                this.sqlLite.all(sql,[take,skip]).then((rows)=>{
                    let docs=(rows||[]).map(item=>{
                        let ret=new Language();
                        ret.id=item.id;
                        ret.guid=item.guid;
                        ret.twoLettersName=item.twoLettersName;
                        ret.originalName=item.originalName;
                        ret.name=item.name;
                        ret.udpFile=item.udpFile;
                        ret.isRightToLeft=item.isRightToLeft;
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

    getById(guid:number):Promise<Language>{
        return new Promise((resolve, reject)=> {
            this.sqlLite.open().then(()=>{
                let sql=`select * from languages where guid=? `;
                this.sqlLite.getFirstOrDefalut(sql,guid).then((item)=>{
                    let ret=null;
                    if(item){
                        ret=new Language();
                        ret.id=item.id;
                        ret.guid=item.guid;
                        ret.twoLettersName=item.twoLettersName;
                        ret.originalName=item.originalName;
                        ret.name=item.name;
                        ret.udpFile=item.udpFile;
                        ret.isRightToLeft=item.isRightToLeft;
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

    createLanguagepath(lang:Language){
        let strpath=this.fsUow.getPath([lang.name]);
        this.fsUow.createDireIfNotExiste(strpath);
    }
    create(lang:Language):Promise<Language>{
        lang.guid=this.sqlLite.getGuid();
        return new Promise((resolve, reject)=> {
            this.sqlLite.openCreate(this.createTable()).then(()=>{
                let sql=`INSERT INTO languages (guid,name,twoLettersName,originalName,udpFile,isRightToLeft,creationDate,lastUpdateDate)  VALUES (?,?,?,?,?,?,?,?) `;
                let params=[lang.guid,lang.name,lang.twoLettersName,lang.originalName,lang.udpFile,lang.isRightToLeft?1:0,lang.creationDate.getTime(),lang.lastUpdateDate.getTime()];
                this.sqlLite.run(sql,params).then((row)=>{
                    resolve(lang);
                })
                .catch((er)=>reject(er)) 
                .finally(()=>  this.sqlLite.close());
            })
        });
    }

    update(lang:Language):Promise<Language>{
       
        let guid=lang.guid;
        return new Promise((resolve, reject)=> {
            this.sqlLite.open().then(()=>{
                let sql=` UPDATE  languages SET name=?,twoLettersName=?,originalName=?,udpFile=?,isRightToLeft=?,lastUpdateDate=?  where guid=?  `;
                let params=[lang.name,lang.twoLettersName,lang.originalName,lang.udpFile,lang.isRightToLeft?1:0,lang.lastUpdateDate.getTime(),guid];
                this.sqlLite.run(sql,params).then((row)=>{
                    resolve(lang);
                })
                .catch((er)=>reject(er)) 
                .finally(()=>  this.sqlLite.close());
            })
        });
    }
    deleteLanguagepath(lang:Language){
        let strpath=this.fsUow.getPath([lang.name]);
        this.fsUow._deleteFolderRecursive(strpath);
    }
    delete(lang:Language):Promise<any>{
        return new Promise((resolve, reject)=> {
            this.sqlLite.open().then(()=>{

                let sql=` DELETE FROM  languages  where guid=?  `;
                let params=[lang.guid];
                this.sqlLite.run(sql,params).then((row)=>{
                    resolve(row);
                })
                .catch((er)=>reject(er)) 
                .finally(()=>  this.sqlLite.close());
            })
        });
    }

    createTable():string{
        return `CREATE TABLE IF NOT EXISTS languages ( 
                    id INTEGER PRIMARY KEY,
                    guid INTEGER  NULL UNIQUE,
                    name TEXT NOT NULL UNIQUE,
                    creationDate real NOT NULL UNIQUE,
                    lastUpdateDate real NOT NULL UNIQUE,
                    twoLettersName TEXT NOT NULL UNIQUE,
                    originalName TEXT NOT NULL UNIQUE,
                    udpFile TEXT NULL ,
                    isRightToLeft INTEGER NULL
                  )
            `
    }

    trainUDPipeAutoTagger(model:TrainArgs, modelPath:string){
        if(!modelPath)
           throw new Error("model path is required");
        let params= model.toParams(modelPath);
       this.fsUow.executeProc(this.settings.updpipeexePath,params) ;
      }

      isTraining(){
          return  this.fsUow.isTraining();
      }

      hasUDpipeeFile(lang:Language){
        let strpath=this.fsUow.getPath([lang.name,"model.udpipe"]);
        return this.fsUow.exists(strpath);
      }

}