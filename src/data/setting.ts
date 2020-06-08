import { Injectable } from '@angular/core';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root'
})
export class DataSettings{

    constructor() {
     if(process.env.HOME) 
        this.ROOT_PATH="../../../../../../";
    }
    
    DB_PATH="zconllu.db";
    PAGE_SIZE=10;
    CONLLU_COLUMNS=["ID", "FORM", "LEMMA", "UPOS", "XPOS", "FEATS", "HEAD", "DEPREL", "DEPS", "MISC"];
    CONLLU_V2= 2;
    CONLLU_V1 = 1;
    CONLLU_UNDERSCORE= "_";
    GENERIC_TOKENIZER_NORMALIZED_SPACES = "normalized_spaces";
    GENERIC_TOKENIZER_PRESEGMENTED = "presegmented";
    GENERIC_TOKENIZER_RANGES = "ranges";


    NEW_DOC_REG="newdoc id|newdoc";
    NEW_PAR_REG="newpar id|newpar";
    SENT_ID_REG="sent_id";
    ROOT_PATH="../../../../";

   get updpipeexePath(){
      return this.ROOT_PATH+ "res\\tagger\\UDsharpCore.exe";
   } 
   get conlludirPath(){ 
    return this.ROOT_PATH+"res/db";
 } 

}