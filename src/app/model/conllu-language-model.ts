import{ConlluModel} from "./conllu-model"

import { Language } from '../../domain/language';
import{AuditModel}from "./audit-model"

export class ConlluLanguageModel extends  AuditModel {
    
    conlluFiles:Array<ConlluModel>=[];
    isPrestine:boolean;
    isExpanded:boolean;
    isTraining:boolean;
    udpeFile:string="";
    languageName:string="";
    languageTwoLetters:string="";
    originalName:string="";
    constructor(lang:Language) {
      super();
      if(lang){
       this.languageName=lang.name;
       this.languageTwoLetters=lang.twoLettersName;
       this.originalName=lang.originalName;
       this.id=lang.id+"";
       this.guid=lang.guid;
       this.udpeFile=lang.udpFile;
      }
    }

    getLanguage():Language{
      let lng=new Language();
      lng.id=+this.id;
      if(this.guid)
        lng.guid=this.guid;
      lng.name=this.languageName;
      lng.udpFile=this.udpeFile;
      lng.twoLettersName=this.languageTwoLetters;
      lng.originalName=this.originalName;
      return lng;
    }

  }