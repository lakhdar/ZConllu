import{EntityBase} from"./entity-base";
import{Sentence} from"./sentence";

export class ConlluDocument extends EntityBase{
    name:string;
    newdocId:string;
    languageId:number
    sentences:Sentence[];
    totalSentences:number;
    totalWords:number;
    totalLemmas:number;
    totalUpostags:number
    constructor() {
        super();
        this.sentences=[];
    }
}