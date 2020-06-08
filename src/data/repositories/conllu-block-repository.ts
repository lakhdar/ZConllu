import{FileSystemeUoW}from "../uow/fs-uow";
import{DataSettings} from"../setting";
import{ConlluDocument}from "../../domain/conllu-document";
import{Sentence}from "../../domain/sentence";
import{WordLine,MultiwordTokenLine,EmptyNodeLine}from "../../domain/word-line";


import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
  })
export class ConlluBlockReaderRepository{
    multiwordTokenCounter=0;
    lastMultiwordToken=0;
    constructor(public fsUow:FileSystemeUoW,public settings:DataSettings) { }

    parseFile(document:ConlluDocument,filepath:string,version:number):ConlluDocument{
        if(!this.fsUow.exists(filepath))
            throw new Error(" File  Not Found: "+filepath);
        if(!document)
             throw new Error(" document is required ");
        let readlines=this.fsUow.getFileLines(filepath);
        let block=[];
        let line="true"
        while(line){
            line=readlines.readline();
            let strline=line?line.trim().replace(/\n|\r/g,""):undefined
            if(strline){
                block.push(strline) ;
            }else{
                if(block.length)
                    document=this.parseBlock(block,document,version);
                block=[];
            }
        }
        
        return document;
    }

    parseBlock(block:string[],document:ConlluDocument,version:number):ConlluDocument{
        let currentsentence=new Sentence();
        let row=0;
        this.multiwordTokenCounter=0;
        this.lastMultiwordToken=0;
        for(let line of block){
            let tmp=this.getNewDocId(line);
            if(tmp){
                document.newdocId=tmp;
            }else{
                tmp=this.getNewParId(line);
                if(tmp){
                    currentsentence.newparid=tmp;
                }else{
                    tmp=this.getSentId(line);
                    if(tmp){
                    currentsentence.sentId=tmp;
                    }else{
                        tmp=this.getorig_file_sentence(line);
                        if(tmp){
                            currentsentence.sourcesentid=tmp;
                        }else{
                            tmp=this.getS_type(line);
                            if(tmp){
                                currentsentence.s_type=tmp;
                            }else{
                                tmp=this.getText(line);
                                if(tmp){
                                  currentsentence.text=tmp;
                                }else if(!/^#/.test(line)){
                                    currentsentence= this.parseWords(line,currentsentence,version,row);
                                    row++;
                                }
                            }
                        }
                    }
                }
            }
        }
        currentsentence.documentId=document.guid;
        document.sentences.push(currentsentence);
        return document;
    }

     

    parseWords(line:string,sentence:Sentence,version:number,row:number):Sentence{
        let tokens=line.split(/\t/);
        let token=this.validateLine(tokens,line,version);
        if(/-/gi.test(token)){
            this.validateMultiwordToken(tokens,token,line,sentence);
            sentence=this.parseWorline(tokens,token,line,sentence,row );
        }
        else if(/\./g.test(token)){
            this.validateEmptyNode(tokens,token,line,sentence);
            sentence=this.parseWorline(tokens,token,line,sentence,row );
        } else{
            let id=+token;
            if(isNaN(id))
                throw new Error(" CoNLL-U id empty "+token +" of CoNLL-U line"+line );
            if(id!= ((sentence.lines.length-this.multiwordTokenCounter)+1))
                throw new Error(" Incorrect ID "+token +" of CoNLL-U line "+line);
            let head=-1
            let strHead=tokens[6];
            if(strHead!="_")
                head =+strHead;
            if(isNaN(head))
                throw new Error(" CoNLL-U head empty "+token +" of CoNLL-U line"+line );
            if(head<0)
                throw new Error(" Numeric head value "+token +" cannot be negative in line "+line );
              
            sentence=this.parseWorline(tokens,token,line,sentence,row ,head);
        }
        return sentence;
         
    }

    parseWorline(tokens:string[],token:string,line:string,sentence:Sentence,row:number,head?:number ){
        //let word=new Word(tokens[1],tokens[9],sentence.words.length,head);
        let word=new WordLine();
        word.indx=row+1;
        word.strIndex=token;
        word.form=tokens[1];
        word.lemma=tokens[2];
        word.misc=tokens[9];
        if(head||head==0)word.head=head;
        word.upostag=tokens[3];
        word.xpostag=tokens[4];
        word.feats=tokens[5];
        word.deprel=tokens[7];
        word.deps=tokens[8];
        word.misc=tokens[9];
        sentence.lines.push(word);
        return sentence;
    }

    validateLine(tokens:string[],line:string,version:number):string{
        if(!tokens||tokens.length!=this.settings.CONLLU_COLUMNS.length)
            throw new Error("The CoNLL-U line "+line+"  does not contain 10 columns!");
        let token=tokens[0];
        if(!token)
            throw new Error("The CoNLL-U line "+line+"  contains empty column "+this.settings.CONLLU_COLUMNS[0]+"." );
        
        if(version<this.settings.CONLLU_V2){
            for(let j=3;j<10;j++){
                if(token==' '||tokens[j]==' ')
                        throw new Error("The CoNLL-U line "+line+"  contains spaces in column "+this.settings.CONLLU_COLUMNS[j]+"." );
            }
        }
        return token
    }
    validateMultiwordToken(tokens,token:string,line:string,sentence:Sentence){
        let parts=token.split('-');
        if(parts.length>2){
            throw new Error("Cannot parse ID of multiword token  "+ token+" in line "+line+"." );
        }
        let from=parseInt(parts.shift(),10);
        if(isNaN(from)){
            throw new Error(" Incorrect CoNLL-U id  "+from +" of multiword token "+ token+" in line "+line+"." );
        }
        let to=parseInt(parts.pop(),10);
        if(!to && to!=0){
            throw new Error(" Incorrect CoNLL-U id  "+to +"  of multiword token "+ token+" in line "+line+"." );
        }
        if(from>sentence.lines.length+1)
            throw new Error(" Incorrect ID  "+from +" of multiword token "+ token+" in line "+line+"." );
        if (to < from){
            throw new Error(" Incorrect range  "+from+" to "+to +" of multiword token "+ token+" in line "+line+"." );
        }
        if (from<this.lastMultiwordToken){
            throw new Error(" Multiword token  "+line+"  overlaps with the previous one." );
        }
        this.lastMultiwordToken=to;
        this.multiwordTokenCounter++
        for(let j=2;j<9;j++){
            if(tokens[j]!="_")
                throw new Error(" Column   "+this.settings.CONLLU_COLUMNS[j]+" of an multi-word token" +line+" is not an empty!");
        }
      
    }

    validateEmptyNode(tokens,token:string,line:string,sentence:Sentence){
        let parts=token.split('.');
        if(parts.length>2){
            throw new Error("Cannot parse ID of empty node  "+line+"." );
        }
        let id=+parts.shift();
        if(isNaN(id)){
            throw new Error(" CoNLL-U empty node id "+id  );
        }
        let index=+parts.pop();
        if(!index && index!=0){
            throw new Error(" CoNLL-U empty node index "+index  );
        }
        if(id > sentence.lines.length)
            throw new Error(" Incorrect ID  "+id +" of empty node token "+ token+" in line "+line+".");
        this.multiwordTokenCounter++
        for(let j=6;j<8;j++){
            if (tokens[j] != '_'){
                throw new Error(" Column   "+this.settings.CONLLU_COLUMNS[j]+" of an empty node token " +line+" is not an empty!");
            }
        }

    }
    getNewDocId(line:string):string {
        let id= this.getCommentValue("newdoc id",line);
        if (!id)
            id= this.getCommentValue("newdoc",line);
        return  id;
    }
    getNewParId(line:string):string {
        let id= this.getCommentValue("newpar id",line);
         if (!id)
             id=this.getCommentValue("newpar",line);
         return id;
     }

    getSentId(line:string):string {
        return this.getCommentValue("sent_id",line);
    }
    getorig_file_sentence(line:string):string {
        return this.getCommentValue("orig_file_sentence",line);
    }
    getS_type(line:string):string {
        return this.getCommentValue("s_type",line);
    }
      
    getText(line:string):string {
        return this.getCommentValue("text",line);
    }


     
    getCommentValue(name:string,line:string) :string {
        let value="";
        let reg=new RegExp("^#\\s+"+name+"\\s?=","i");
            if (reg.test(line)) {
               let splt=line.split("=")
               let left=splt.shift();
               let re=new RegExp(name,"gi");
               if(re.test(left)){
                    value=splt.pop().trim();
               }
            }else{
                reg=new RegExp("^#\\s+"+name+"\\s+([\w|\W]*)","i");
                let matches=reg.exec(line)
                if (matches&&matches.length>1) {
                    value=matches[1];
                 }
            }
        return value;
    }

}