
import{AuditModel}from "./audit-model"
import { ConlluDocument } from '../../domain/conllu-document';
import { Sentence } from '../../domain/sentence';
import { WordLine } from '../../domain/word-line';
 
import { DataSettings } from '../../data/setting';
export class ConlluModel extends AuditModel {
    fileName:string;
    fileId:string="";
    languageId:number;
    totalsentences:number;
    totalLemmas:number;
    totalWords:number;
    totalUpostags:number;
    constructor(doc:ConlluDocument) {
        super();
        if(doc){
            this.fileName=doc.name;
            this.fileId=doc.newdocId;
            this.languageId=doc.languageId;
            this.id=doc.id+"";
            this.guid=doc.guid;
            this.totalsentences=doc.totalSentences||0;
            this.totalLemmas=doc.totalLemmas||0;
            this.totalWords=doc.totalWords||0;
            this.totalUpostags=doc.totalUpostags||0;
            
           }
    }

    getDocument():ConlluDocument{
        let lng=new ConlluDocument();
        lng.id=+this.id;
        if(this.guid)
          lng.guid=this.guid;
        lng.name=this.fileName;
        lng.newdocId=this.fileId;
        lng.languageId=this.languageId;
        return lng;
      }
  
  }

  export class ConlluModelDetails extends ConlluModel {
    sentences:ConlluSentenceDetails[]=[];
    constructor(doc:ConlluDocument) {
      super(doc);
      if(doc){
        this.sentences=(doc.sentences||[]).map(item=>new ConlluSentenceDetails(item));
      }
    }
    getDocument():ConlluDocument{
      let lng=new ConlluDocument();
      lng.id=+this.id;
      if(this.guid)
        lng.guid=this.guid;
      lng.name=this.fileName;
      lng.newdocId=this.fileId;
      lng.languageId=this.languageId;
      lng.sentences=(this.sentences||[]).map(item=>item.getSentence());
      return lng;
    }
  }


  export class ConlluSentenceDetails extends AuditModel {
    isExpanded:boolean=false;
    sentId:string;
    text:string;
    newparid:string;
    translit:string;
    sourcesentid:string;
    documentId:number;
    lines:ConlluWordLineModel[];
    translations:TranslationModel[]=[];

    constructor(sent:Sentence){
      super();
      if(sent){
        this.id=sent.id+"";
        this.sentId=sent.sentId;
        this.text=sent.text;
        this.newparid=sent.newparid;
        this.translit=sent.translit;
        this.sourcesentid=sent.sourcesentid;
        this.guid=sent.guid;
        this.documentId=sent.documentId;
        this.lines=(sent.lines||[]).map(item=>new ConlluWordLineModel(item));
        this.translations =JSON.parse(sent.translations||"[]") ||[];
      }
      
  }

  getSentence():Sentence{
    let lng=new Sentence();
    lng.id=+this.id;
    if(this.guid)
      lng.guid=this.guid;
    lng.sentId=this.sentId;
    lng.text=this.text;
    lng.newparid=this.newparid;
    lng.translit=this.translit;
    lng.sourcesentid=this.sourcesentid;
    lng.documentId=this.documentId;
    lng.lines=(this.lines||[]).map(item=>item.getLine());
    lng.translations=JSON.stringify (this.translations||[])
    return lng;
  }  
}

export class ConlluWordLineModel extends AuditModel {
  index:string;
  indx:number;
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
  sentenceId:number;
  
  constructor(line:WordLine){
      super();
      let settings=new DataSettings();
        this.id=(line||{}).id+"";
        this.guid=(line||{}).guid;
        this.sentenceId=(line||{}).sentenceId;
        this.indx=(line||{}).indx;

        this.index=(line||{}).strIndex;
        this.word=(line||{}).form||settings.CONLLU_UNDERSCORE;
        this.lemma=(line||{}).lemma||settings.CONLLU_UNDERSCORE;
        this.POS=(line||{}).upostag||settings.CONLLU_UNDERSCORE;
        this.XPOS=(line||{}).xpostag||settings.CONLLU_UNDERSCORE;
        this.FEATS=(line||{}).feats||settings.CONLLU_UNDERSCORE;
        this.HEAD=(line||{}).head&&(line||{}).head>-1?line.head+"":settings.CONLLU_UNDERSCORE;
        this.DEPREL=(line||{}).deprel||settings.CONLLU_UNDERSCORE;
        this.DEPS=(line||{}).deps||settings.CONLLU_UNDERSCORE;
        this.DEPS=(line||{}).deps||settings.CONLLU_UNDERSCORE;
        this.MISC=(line||{}).misc||settings.CONLLU_UNDERSCORE;
  }

  getLine():WordLine{
    let lng=new WordLine();
    let settings=new DataSettings();
    lng.id=+this.id;
    lng.sentenceId=this.sentenceId;
    let idsx=+(this.index+"").split(/-|\./).shift();
    lng.indx=idsx;
    if(this.guid)
      lng.guid=this.guid;
    lng.strIndex=this.index+"";
    lng.misc=this.MISC;
    lng.form=this.word==settings.CONLLU_UNDERSCORE?"":this.word;
    lng.lemma=this.lemma==settings.CONLLU_UNDERSCORE?"":this.lemma;
    lng.upostag=this.POS==settings.CONLLU_UNDERSCORE?"":this.POS;
    lng.xpostag=this.XPOS==settings.CONLLU_UNDERSCORE?"":this.XPOS;
    lng.feats=this.FEATS==settings.CONLLU_UNDERSCORE?"":this.FEATS;
    let hd=(+this.HEAD)+1;
    lng.head= !hd?-1:+this.HEAD;
    lng.deprel=this.DEPREL==settings.CONLLU_UNDERSCORE?"":this.DEPREL;
    lng.deps=this.DEPS==settings.CONLLU_UNDERSCORE?"":this.DEPS;
    
    return lng;
  } 
  
 

}
export class TranslationModel{
    language:string;
    text:string;
}