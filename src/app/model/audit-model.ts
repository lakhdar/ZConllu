export class AuditModel {
    public creationDate:Date;
    public lastUpdateDate:Date;
    id:string;
    constructor() {
        this.creationDate=new Date();
        this.lastUpdateDate=new Date();
        this.id=this.creationDate.getTime()+"_"+((Math.random() * 10 | 0) + 1) ;
    }

   
  }