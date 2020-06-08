import{FileSystemeUoW}from "../uow/fs-uow";
import{DataSettings} from"../setting";
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class SqlLiteUoW{
    dataBase:any;
    constructor(public settings :DataSettings,public fsUow:FileSystemeUoW) {
    }


    getFirstOrDefalut(query, params):Promise<any> {
        return new Promise((resolve, reject)=> {
            this.dataBase.get(query, params, (err, row)=>  {
                if(err) reject("Read error: " + err.message)
                else {
                    resolve(row)
                }
            })
        }) 
    }

    run(query:string,params?:any[]):Promise<any>  {
        return new Promise((resolve, reject)=> {
            this.dataBase.run(query,params ,
                (err) => {
                    if(err) reject(err.message)
                    else    resolve(true)
            })
        })    
    }

    all(query:string, params?:any[]):Promise<any>  {
        return new Promise((resolve, reject)=> {
            params=params||[]
            this.dataBase.all(query, params, (err, rows) => {
                if(err) reject("Read error: " + err.message)
                else {
                    resolve(rows)
                }
            })
        }) 
    }


    openCreate(sql:string,dbPath?:string):Promise<any> {
        dbPath=dbPath||this.fsUow.getPath([this.settings.DB_PATH]);
        return new Promise((resolve,reject) =>{
            let sqlite3=window.require("sqlite3");
            this.dataBase = new sqlite3.Database(dbPath,
                (err)=> {
                    if(err) reject("Open error: "+dbPath+"  "+ err.message)
                    else{
                        this.run(sql).then(()=>{
                            resolve(dbPath + " opened");
                        }).catch((er)=>reject(dbPath+ "  "+er));
                    }    
                }
            )   
        })
    }


    open(dbPath?:string):Promise<any> {
        dbPath=dbPath||this.fsUow.getPath([this.settings.DB_PATH]);
        return new Promise((resolve,reject) =>{
            let sqlite3=window.require("sqlite3");
            this.dataBase = new sqlite3.Database( dbPath,
                (err)=> {
                    if(err) reject("Open error: "+ err.message)
                    else{
                        resolve(dbPath + " opened");
                    }    
                }
            )   
        })
    }


    close() :Promise<any>{
        return new Promise((resolve) =>{
            this.dataBase.close()
            resolve(true)
        }) ;
    }

     createTableIfNotExists(sql:string):Promise<any>{
        return this.run(sql);
     }
     createDocumentTable(){
        return `CREATE TABLE IF NOT EXISTS documents ( 
                    id INTEGER PRIMARY KEY,
                    guid INTEGER  NULL UNIQUE,
                    languageId INTEGER NOT NULL,
                    name TEXT NOT NULL UNIQUE,
                    creationDate real NOT NULL ,
                    lastUpdateDate real NOT NULL ,
                    newdocId TEXT  NULL ,
                    FOREIGN KEY (languageId) REFERENCES languages (guid)
                  )
            `
        }
    
     createSentenceTable(){
        return `CREATE TABLE IF NOT EXISTS sentences ( 
            id INTEGER PRIMARY KEY,
            documentId INTEGER NOT NULL,
            guid INTEGER  NULL UNIQUE,
            newparid TEXT  NULL ,
            translit TEXT  NULL ,
            sourcesentid TEXT  NULL ,
            
            sentId TEXT NOT NULL ,
            text TEXT NOT NULL ,
            s_type TEXT  NULL ,
            translations TEXT  NULL ,
            creationDate real NOT NULL ,
            lastUpdateDate real NOT NULL ,

            FOREIGN KEY (documentId) REFERENCES documents (guid)
               
        )
    `
}

createWordTable(){
    return `CREATE TABLE IF NOT EXISTS wordlines ( 
        id INTEGER PRIMARY KEY,
        guid INTEGER  NULL UNIQUE,
        sentenceId INTEGER NOT NULL,
        indx INTEGER NOT NULL ,
        head INTEGER  NULL ,
        strIndex TEXT NOT NULL ,
        
        form TEXT NOT NULL ,
        misc TEXT  NULL ,
        

        idLast INTEGER  NULL ,
        idFirst INTEGER   NULL ,

        lemma TEXT  NULL ,
        upostag TEXT  NULL ,

        xpostag TEXT  NULL ,
        feats TEXT  NULL ,
        deprel TEXT  NULL ,
        deps TEXT  NULL ,
        children TEXT  NULL ,
        
        creationDate real NOT NULL ,
        lastUpdateDate real NOT NULL ,

        FOREIGN KEY (sentenceId) REFERENCES sentences (guid)
    )
`
}
createTranslationTable(){
    return `CREATE TABLE IF NOT EXISTS translations ( 
        id INTEGER PRIMARY KEY,
        guid INTEGER  NULL UNIQUE,
        sentenceId INTEGER NOT NULL,
        languageId INTEGER NOT NULL ,
        languageName TEXT NOT NULL ,
        creationDate real NOT NULL ,
        lastUpdateDate real NOT NULL ,
        FOREIGN KEY (sentenceId) REFERENCES sentences (guid)
    )
`
}  

getInsertSql(obj:any,tablename:string,exludeProps:string[]):string{
   
    if(!obj) return ;
    let sql=`INSERT INTO ${tablename} `;
    let names=this.getNames(obj,exludeProps);
    sql+=" ( "+names.join(',')+") VALUES ";
    sql+=this.getNameValues(obj,names)
    return sql;
}

getInsertManySql(objs :any[],tablename:string,exludeProps:string[]):string{
    if(!objs||!objs.length||!objs[0]) return ;
    let sql=`INSERT INTO ${tablename} `;
    let names=this.getNames(objs[0],exludeProps);
    sql+=" ( "+names.join(',')+") VALUES ";
    sql+=(objs||[]).map(item=>this.getNameValues(item,names)).join(",")
    return sql;
}

getNames(obj:any,exludeProps:string[]):string[]{
    let names=[]
    for(let p in obj){
        let pval=obj[p]
        if((pval&&(/number|string/gi.test(typeof pval)|| pval.getTime)) ){
            if(exludeProps.findIndex(x=>new RegExp("^"+x+"$","gi").test(p))<0){
                names.push(p+"");
            }
        }
    }
    return names;
}
getNameValues(obj:any,props:string[]):string{
    let ret=" ( ";
    let vals=(props||[]).map(item=>{
        let pval=obj[item];
        if(/string/gi.test(typeof pval)){
            pval="'"+pval.replace(/"|'/gi,"\"")+"'";
        }
        if(pval&&pval.getTime){
            pval=pval.getTime();
        }
        if(!pval){
            pval="''";
        }
        return pval;
    }).join(',');
    ret+=vals+" ) ";
    return ret;
}  
    butchRun(ary:any[],tablename:string,exludeProps:string[],copy:any[],resolver?:any,rejecter?:any):Promise<any>{
        copy=copy||[]
        return new Promise((resolve, reject)=> {

            let batch=(ary||[]).splice(0,10).map(ite=>{ite.guid=(((Math.random() * 1000100024 | 0) + 1));return ite});
            copy=copy.concat(batch)
            if(batch&&batch.length){
                let sql=this.getInsertManySql(batch,tablename,exludeProps);
               return this.run(sql,[]).then(()=>{
                   setTimeout(() => {
                    this.butchRun(ary,tablename,exludeProps,copy,resolver||resolve,rejecter||reject);
                       
                   }, 10);
                }).catch(er=>{(rejecter||reject)(er);});
            }else{
               (resolver||resolve)(copy)
            }
        });
    }
       
  getGuid():number{
        let strId=(((Math.random() * 100000100024 | 0) + 1))+"";
      return parseInt(strId,10) ;
  }
}