import{Token}from "./token"

export class WordLine extends Token {
    indx:number;
    lemma:string;   // lemma
    upostag:string; // universal part-of-speech tag
    xpostag:string; // language-specific part-of-speech tag
    feats:string;   // list of morphological features
    head:number;       // head, 0 is root, <0 is undefined
    deprel:string;  // dependency relation to the head
    deps:string;    // secondary dependencies
    children :number[];
    constructor() {
        super();
        this.indx=-1;
        this.head=-1;
    }
}
export class MultiwordTokenLine extends Token {
    idLast:number;
    idFirst:number
    constructor( ) {
        super();
        this.idFirst= -1;
        this.idLast=-1;
    }
}

export class EmptyNodeLine extends Token{
    sentenceId:number;
    indx:number;
    lemma:string;   // lemma
    upostag:string; // universal part-of-speech tag
    xpostag:string; // language-specific part-of-speech tag
    feats:string;   // list of morphological features
    deps:string;    // secondary dependencies
    constructor() {
        super();
        this.indx=-1;
    }
}
