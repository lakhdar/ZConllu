import {FormatReaderService} from "./format-reader-service"
import {Sentence} from "../model/sentence"
import {Word,MultiwordToken} from "../model/word"
import {EmptyNode} from "../model/empty-node"

export class ConlluFormatReaderService extends FormatReaderService{
    version:string;
    text:string;
    textCopy:string;
    columns:string[];
    constructor() {
        super();
        this.columns=["ID", "FORM", "LEMMA", "UPOS", "XPOS", "FEATS", "HEAD", "DEPREL", "DEPS", "MISC"];
        this.CONLLU_V2= "v2";
        this.CONLLU_V1 = "v1";
        this.GENERIC_TOKENIZER_NORMALIZED_SPACES = "normalized_spaces";
        this.GENERIC_TOKENIZER_PRESEGMENTED = "presegmented";
        this.GENERIC_TOKENIZER_RANGES = "ranges";
    }


    readBlock(realline:any):string{
        if(!realline||(typeof(realline.readline)!="function")){
            throw new Error("readBlock requires valid line-reader-sync.");
        }
        let line="true";
        let ret="";
        while(line){
            line=(realline.readline()+"").trim().replace(/\\n|\\r/g,"");
            if(line){
                ret+=line+"\\r\\n";
            }else{
                break;
            }
        }
        return ret;
    }
    

    setText(text:string,makecopy?:boolean) {
        if (makecopy) {
          this.textCopy=text;
          this.text = text;
        }
        this.text = text;
      }
    resetDocument() {
        this.setText("");
    }

    getNextSentence(){
        let sentence=new Sentence();
        let lines=(this.text+"").split(/\\r\\n/gi);
        sentence.comments=lines.filter(line=>/^#/.test(line))||[];
        let wordLines=lines.filter(line=>!!line&&!(/^#/.test(line)))||[];
        let lastMultiwordToken=0;

        for(let line of wordLines){
            let tokens=(line+"").split(/\\t/g);
            if(!tokens||tokens.length!=10)
                throw new Error("The CoNLL-U line "+line+"  does not contain 10 columns!");
            let token=tokens[0];
            if(!token)
                    throw new Error("The CoNLL-U line "+line+"  contains empty column "+this.columns[0]+"." );
            if(+this.version<2){
                for(let j=3;j<10;j++){
                    if(token==' '||tokens[j]==' ')
                            throw new Error("The CoNLL-U line "+line+"  contains spaces in column "+this.columns[0]+"." );
                }
            }
            if(/-/gi.test(token)){
                let parts=token.split('-');
                if(parts.length>2){
                    throw new Error("Cannot parse ID of multiword token  "+ token+" in line "+line+"." );
                }
                let from=+parts.shift();
                if(isNaN(from)){
                    throw new Error(" Incorrect CoNLL-U id  "+from +" of multiword token "+ token+" in line "+line+"." );
                }
                let to=+parts.pop();
                if(!to && to!=0){
                    throw new Error(" Incorrect CoNLL-U id  "+to +"  of multiword token "+ token+" in line "+line+"." );
                }
                if(from!=sentence.words.length)
                    throw new Error(" Incorrect ID  "+from +" of multiword token "+ token+" in line "+line+"." );
                if (to < from){
                    throw new Error(" Incorrect range  "+from+" to "+to +" of multiword token "+ token+" in line "+line+"." );
                }
                if (from<lastMultiwordToken){
                    throw new Error(" Multiword token  "+line+"  overlaps with the previous one." );
                }
                lastMultiwordToken=to;
                for(let j=2;j<9;j++){
                    if(tokens[j]!="_")
                        throw new Error(" Column   "+this.columns[0]+" of an multi-word token" +line+" is not an empty!");
                }
                let mltWOrd=new MultiwordToken(tokens[1],tokens[9]=="_"?"":tokens[9],from,to);
                sentence.multiwordTtokens.push(mltWOrd);
                continue;
            }else  if(/\./g.test(token)){
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
                if(id!=(sentence.words.length-1))
                    throw new Error(" Incorrect ID  "+id +" of empty node token "+ token+" in line "+line+"." );
                let perdiat=(!sentence.emptyNodes.length) && index == 1;
                perdiat=perdiat||(sentence.emptyNodes.length && sentence.emptyNodes[sentence.emptyNodes.length-1].id < id && index == 1);
                perdiat=perdiat||(sentence.emptyNodes.length && sentence.emptyNodes[sentence.emptyNodes.length-1].id == id && index == sentence.emptyNodes[sentence.emptyNodes.length-1].index + 1);
                if(!perdiat){
                    throw new Error("Incorrect ID index  "+index +"of empty node token"+line+"." );
                } 
                for(let j=6;j<8;j++){
                    if (tokens[j] != '_'){
                        throw new Error(" Column   "+this.columns[0]+" of an empty node token " +line+" is not an empty!");
                    }
                }
                let nde=new EmptyNode(id,index);
                nde.form=tokens[1];
                nde.lemma=tokens[2];
                if(tokens[3]=="_")nde.upostag=tokens[3];
                if(tokens[4]=="_")nde.xpostag=tokens[4];
                if(tokens[5]=="_")nde.feats=tokens[5];
                if(tokens[8]=="_")nde.deps=tokens[8];
                if(tokens[9]=="_")nde.misc=tokens[9];
                sentence.emptyNodes.push(nde);
                continue;
            }else{
                let id=+token;
                if(isNaN(id))
                    throw new Error(" CoNLL-U id empty "+token +" of CoNLL-U line"+line );

                if(id!=sentence.words.length)
                    throw new Error(" Incorrect ID "+token +" of CoNLL-U line "+line );
                let head=-1
                if(tokens[6]!="_")
                    head =+tokens[6];
                if(isNaN(head))
                    throw new Error(" CoNLL-U head empty "+token +" of CoNLL-U line"+line );
                if(head<0)
                    throw new Error(" Numeric head value "+token +" cannot be negative in line "+line );
                let word=new Word(tokens[1],tokens[9],sentence.words.length,head);
                if(tokens[3]=="_")word.upostag=tokens[3];
                if(tokens[4]=="_")word.xpostag=tokens[4];
                if(tokens[5]=="_")word.feats=tokens[5];
                if(tokens[7]=="_")word.deprel=tokens[7];
                if(tokens[8]=="_")word.deps=tokens[8];
                if(tokens[9]=="_")word.misc=tokens[9];
                sentence.words.push(word);
            }

        }
        if (lastMultiwordToken >= sentence.words.length){
            throw new Error("There are words missing for multiword token "+sentence.multiwordTtokens.slice(-1).pop().form+"  ." );
        }
        for(let wrd of sentence.words){
            if(wrd.id&&wrd.head>0){
                if (wrd.head >= sentence.words.length)
                    throw new Error("Node ID "+wrd.id+"form "+ wrd.form+"has too large head: "+ wrd.head+"  .");
                sentence.setHead(wrd.id, wrd.head, wrd.deprel);
            }
        }
        return sentence;
    }

}