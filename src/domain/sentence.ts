import{WordLine,MultiwordTokenLine,EmptyNodeLine}from "./word-line";
import{EntityBase} from"./entity-base";

export class Sentence  extends EntityBase {
    documentId:number;
    sentId:string;
    newparid:string;
    translit:string;
    sourcesentid:string;
    text:string;
    s_type:string;
    
    lines:WordLine[]=[];
    rootForm:string="<root>";
	multiwordLines:MultiwordTokenLine[]=[]; 
    emptyLines:EmptyNodeLine[]=[];
    translations :string;

    total:number;
    totalLines:number

    constructor() {
        super();
    }
}
