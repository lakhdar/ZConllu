import{ConlluModel} from "./conllu-model"


import{AuditModel}from "./audit-model"

export class ConlluLanguageModel extends  AuditModel {
    conlluFiles:Array<ConlluModel>=[];
    isPrestine:boolean;
    isExpanded:boolean;
    udpeFile:string="";
    languageName:string="";
    constructor(langName:string) {
      super();
      this.languageName=(langName+"").toUpperCase();
    }
  }