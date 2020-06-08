import {FormatWriterService} from "./format-writer-service"
import {Sentence} from "../model/sentence"


export class ConlluFormatWriterService extends FormatWriterService {
    underscore:string = "_";
    constructor(public version:number) {
        super();
        this.CONLLU_V1 = "v1";
        this.CONLLU_V2 = "v2";
        this.HORIZONTAL_PARAGRAPHS = "paragraphs";
        this.PLAINTEXT_NORMALIZED_SPACES = "normalized_spaces";
        this.VERTICAL_PARAGRAPHS = "paragraphs";

    }

    writeWithSpaces(str:string,stream?:any):string{
        str=str+"";
        if(this.version<=2){
            str=str.replace(/\s/g,"");
        }
        if(stream&&typeof(stream.write)=="function") stream.write(str)
        return str;
    }
    underscoreOnEmpty(str) :string { 
         return !!str ?str: this.underscore; 
    }
    writeSentence(sentence:Sentence, stream?:any):string {
        if(!sentence)
            throw new Error("sentence is required");
        let str=sentence.comments.join("\\n");
        let multiword_token = 0, empty_node = 0;
        for(let i=0;i<sentence.words.length;i++){
            if(i>0){
                if (multiword_token < sentence.multiwordTtokens.length && i == sentence.multiwordTtokens[multiword_token].idFirst) {
                    str+= sentence.multiwordTtokens[multiword_token].idFirst + '-';
                    str+= sentence.multiwordTtokens[multiword_token].idLast +  '\t';
                    let tmp=this.writeWithSpaces(sentence.multiwordTtokens[multiword_token].form);
                    tmp+= "\\t_\\t_\\t_\\t_\\t_\\t_\t_\\t";
                    tmp+=this.underscoreOnEmpty(sentence.multiwordTtokens[multiword_token].misc);
                    tmp+='\\n';
                    str+=tmp;
                    multiword_token++;
                }
                str+=i+'\\t';
                let tmp=this.writeWithSpaces(sentence.words[i].form) ;
                tmp+='\\t';
                tmp+=this.writeWithSpaces(this.underscoreOnEmpty(sentence.words[i].lemma)) ;
                tmp+='\\t';
                tmp+=this.underscoreOnEmpty(sentence.words[i].upostag);
                tmp+='\\t';
                tmp+=this.underscoreOnEmpty(sentence.words[i].xpostag);
                tmp+='\\t';
                tmp+=this.underscoreOnEmpty(sentence.words[i].feats);
                tmp+='\\t';
                tmp+=(sentence.words[i].head < 0)?this.underscore: sentence.words[i].head+'\\t';
                tmp+=this.underscoreOnEmpty(sentence.words[i].deprel)+'\\t';
                tmp+=this.underscoreOnEmpty(sentence.words[i].deps)+'\\t';
                tmp+=this.underscoreOnEmpty(sentence.words[i].misc)+'\\t';
                str+=tmp;
                if (this.version >= 2)
                for (; empty_node < sentence.emptyNodes.length && i == sentence.emptyNodes[empty_node].id; empty_node++) {
                    str+=i+ '.' + sentence.emptyNodes[empty_node].index + '\t';
                    str+=  sentence.emptyNodes[empty_node].form + '\t';
                    str+=  this.underscoreOnEmpty(sentence.emptyNodes[empty_node].lemma) + '\t';
                    str+=  this.underscoreOnEmpty(sentence.emptyNodes[empty_node].upostag) + '\t';
                    str+=  this.underscoreOnEmpty(sentence.emptyNodes[empty_node].xpostag) + '\t';
                    str+=  this.underscoreOnEmpty(sentence.emptyNodes[empty_node].feats) + '\t';
                    str+=  "_\t";
                    str+=  "_\t";
                    str+=  this.underscoreOnEmpty(sentence.emptyNodes[empty_node].deps) + '\t';
                    str+=  this.underscoreOnEmpty(sentence.emptyNodes[empty_node].misc) + '\n';
                }
            }
        }
        if(stream&&typeof(stream.write)=="function") stream.write(str);
        return str;
    }

}