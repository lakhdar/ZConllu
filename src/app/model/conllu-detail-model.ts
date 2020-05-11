import{AuditModel}from "./audit-model"



export class ConlluDetailModel extends AuditModel {
    fileId:string="";
    totalsentences:number;
    sentences:Array<ConlluSentence>=[];
    constructor(public fileName:string,blocks?:Array<ConlluBlock>) {
        super();
        this.parse(blocks);
    }

    parse(blocks:Array<ConlluBlock>){
        blocks= blocks||[];
        for(let block of blocks){
            for(let line of block.lines){
                this.parseFileId(line);
            }
            let sent=new ConlluSentence(block.lines);
            if(sent.text){
                this.sentences.push(sent)
            }
        }
    }

    parseFileId(line:string){
        if(!this.fileId){
            let strline=line+"";
            if(/^#/.test(strline)){
                strline=strline.replace(/^#/,"").trim();
                if(/^newdoc id/.test(strline)){
                    this.fileId=strline.split("=").pop();
                }
            }
        }
    }
     
  }

  export class ConlluSentence extends AuditModel {
      isExpnaded:boolean=false;
      sentId:string;
      text:string;
      newparid:string;
      translit:string;
      sourcesentid:string;
      lines:Array<ConlluLine>=[];
      translations:Array<any>=[];
      constructor(lines:Array<string>){
        super();
            this.parse(lines);
            
    }
    //
    parse(lines:Array<string>){
        for(let line of lines){
              this.parseText(line);
              this.parseId(line);
              this.parseLine(line);
              this.parseTranslit(line);
              this.parseNewPar(line);
              this.parseTranslations(line);
              
        }
        
    }
//
    parseText(line:string){
        let strline=line+"";
        if(/^#/.test(strline)){
            strline=strline.replace(/^#/,"").trim();
            if(/^text/.test(strline)){
                this.text=strline.split("=").pop();
            }
        }

    }

    // 
    parseTranslations(line:string){
        let strline=line+"";
        if(/^#\s+text_[\w{2}]/.test(strline)){
            let obj=strline.split("=");
            let val=obj.pop().trim();
            let name=obj.shift().replace("#","").trim();
            this.translations.push({name:name,value:val});
        }

    }

    parseSourceSentId(line:string){
        let strline=line+"";
        if(/^#\s+source_sent_id/.test(strline)){
            this.sourcesentid=strline.split("=").pop().trim();
        }
    }

    parseTranslit(line:string){
        let strline=line+"";
        if(/^#\s+translit/.test(strline)){
            this.translit=strline.split("=").pop().trim();
        }

    }
    parseNewPar(line:string){
        let strline=line+"";
        if(/^#\s+newpar\s+id/.test(strline)){
            this.newparid=strline.split("=").pop().trim();
        }

    }
    parseLine(line:string){
        let strline=line+"";
        if(/^\d/.test(strline)){
            let cline=new ConlluLine(strline);
            this.lines.push(cline);
        }
    }
    parseId(line:string){
        let strline=line+"";
        if(/^#/.test(strline)){
            strline=strline.replace(/^#/,"").trim();
            if(/^sent_id/.test(strline)){
                this.sentId=strline.split("=").pop();
            }
        }
    }

  }
  export class ConlluLine extends AuditModel {
    index:number;
    word:string;
    lemma:string;
    POS:string;
    XPOS:string;
    FEATS:string;
    HEAD:string;
    DEPREL:string;
    DEPS:string;
    MISC:string;
    isExpanded:boolean;
    isFEATExpanded:boolean;
    
    constructor(line:string){
        super();
        this.parse(line);
    }


    parse(line:string){
        line=line+"";
        let splt=line.split(/\t/)
        let obj= Object.assign({}, splt);
        if(obj.hasOwnProperty("0"))
                this.index=+obj[0];
        if(obj.hasOwnProperty("1"))
                this.word=obj[1];
        if(obj.hasOwnProperty("2"))
                this.lemma=obj[2];
        if(obj.hasOwnProperty("3"))
                this.POS=obj[3];
        if(obj.hasOwnProperty("4"))
          this.XPOS=obj[4];
        if(obj.hasOwnProperty("5"))
            this.FEATS=obj[5];
        if(obj.hasOwnProperty("6"))
            this.HEAD=obj[6];
        if(obj.hasOwnProperty("7"))
            this.DEPREL=obj[7];
        if(obj.hasOwnProperty("8"))
            this.DEPS=obj[8];
        if(obj.hasOwnProperty("9"))
            this.MISC=obj[9];
    }

    
}

export class ConlluBlock {
    lines:Array<string>=[];
    hasWordLines:boolean=false;
    constructor(){

    }
}