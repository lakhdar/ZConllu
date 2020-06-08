import{EntityBase} from"./entity-base";
import{ConlluDocument} from"./conllu-document";
 

export class Language extends EntityBase{
    name:string;
    twoLettersName:string;
    originalName:string;
    isRightToLeft:boolean;
    documents :ConlluDocument[];
    udpFile:string="";
    constructor() {
        super()
    }
}