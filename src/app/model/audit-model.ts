export class AuditModel {
    public creationDate:Date;
    public lastUpdateDate:Date;
    id:string;
    guid:number;
    constructor() {
        this.creationDate=new Date();
        this.lastUpdateDate=new Date();
    }
  }