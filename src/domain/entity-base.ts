export class EntityBase{
    guid:number;
    id:number;//db id
    public creationDate:Date;
    public lastUpdateDate:Date;
    constructor() {
        this.creationDate=new Date();
        this.lastUpdateDate=new Date();
        // setTimeout(() => {
        //     let strId=(((Math.random() * 1000100024 | 0) + 1))+"";
        //     this.guid=parseInt(strId,10) ;
        // }, 10);
       
    }
}