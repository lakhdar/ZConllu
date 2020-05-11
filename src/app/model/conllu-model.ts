
import{AuditModel}from "./audit-model"

export class ConlluModel extends AuditModel {
    fileName:string;
    fileId:string="";
    constructor(public filePath:string, public totalWords?:number,public totalsents?:number,public totalLemmas?:number) {
        super();
        this.fileName=this.getFileNameWithOutExtension(filePath);
        this.totalLemmas=totalLemmas||0;
        this.totalWords=totalWords||0;
        this.totalsents=totalsents||0;
    }

    getFileNameWithOutExtension(path:string):string{
        path=path+"";
        let name="";
        if(/\/|\\/gi.test(path)){
            name=path.split(/\/|\\/).pop().split('.').shift();
        }else{
            name=path.split('.').shift();
        }
     return name
    }
  }