export class EmptyNode {
    form:string;    // form
    lemma:string;   // lemma
    upostag:string; // universal part-of-speech tag
    xpostag:string; // language-specific part-of-speech tag
    feats:string;   // list of morphological features
    deps:string;    // secondary dependencies
    misc:string;    // miscellaneous information
    constructor(public id:number,public index:number) {
        this.id=id||-1;
        this.index=index||-1;
    }

}