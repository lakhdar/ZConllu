import{Token}from "./token"

export class Word extends Token {
    lemma:string;   // lemma
    upostag:string; // universal part-of-speech tag
    xpostag:string; // language-specific part-of-speech tag
    feats:string;   // list of morphological features
    //head:number;       // head, 0 is root, <0 is undefined
    deprel:string;  // dependency relation to the head
    deps:string;    // secondary dependencies
    children :number[];
    constructor(public form:string,public misc:string,public id?:number,public head?:number) {
        super(form,misc);
        this.id=id||-1;
        this.head=head||-1;
    }
}
export class MultiwordToken extends Token {
 
    constructor(public form:string,public misc:string,public idFirst:number,public idLast:number) {
        super(form,misc);
        this.idFirst= idFirst||-1;
        this.idLast=idLast||-1;
    }
}
