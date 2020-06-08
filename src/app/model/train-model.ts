import{AuditModel}from "./audit-model"
import{ConlluModel}from "./conllu-model"
import{ConlluLanguageModel}from "./conllu-language-model"

export class TrainModel extends AuditModel {
     files:ConlluModel[];
     languageName:string;
     currentTrainFileName:string="";
     currentDevFileName:string="";
     epochs:number=100;
     batch_size:number=50;
     learning_rate:number=0.005;
     dropout:number=0.1;
     early_stopping:number=1
     dimension:number=64;
     initialization_range:number=0.1;
     taggerIterations:number=30;
     parserIterations:number=30;
     method :string= "morphodita_parsito";
    constructor(language:ConlluLanguageModel) {
        super();
        this.languageName=language.languageName;
        this.files=language.conlluFiles||[];
    }

    toParams(modelUdpipe:string){
       let tokenizer=`tokenizer=dimension=${this.dimension};epochs=${this.epochs};initialization_range=${this.initialization_range};batch_size=${this.batch_size};learning_rate=${this.learning_rate};dropout=${this.dropout};early_stopping=${this.early_stopping}`;
       let tagger=`tagger=iterations=${this.taggerIterations}`;
       let parser=`parser=iterations=${this.parserIterations}`;
       let heldout=`heldout=${this.currentDevFileName}`;
       let method=`method=${this.method}`
       let train="train"
       let trainFaile=`train=${this.currentTrainFileName}`;
       let model=`model=${modelUdpipe}`;
       return [train,trainFaile,heldout,model,tokenizer,tagger,parser];
    }
  }