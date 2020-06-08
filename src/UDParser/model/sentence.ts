import{EmptyNode}from "./empty-node";
import{Word,MultiwordToken}from "./word";


export class Sentence  {
    words:Word[]=[];
    comments:string[]=[];
    rootForm:string="<root>";
	multiwordTtokens:MultiwordToken[]=[]; 
    emptyNodes:EmptyNode[]=[];
    constructor() {
    }

    IsEmpty():boolean{
       return !! this.words.length;
    }
    clear() {
        this.words=[] ;
        this.multiwordTtokens=[] ;
        this.emptyNodes=[] ;
        this.comments=[] ;
        this.addWord(this.rootForm);
       
    }
    addWord(form:string):Word {
       let root=new Word(form,"");
       root.lemma = root.upostag = root.xpostag = root.feats = this.rootForm;
        this.words.push(root);
        return root;
    }

    setHead(id:number, head:number, deprel:string) {
        if(id>0&&id<this.words.length){
            if(head<this.words.length){
                if (this.words[id].head >= 0) {
                    let children = this.words[this.words[id].head].children;
                    for (let i = children.length; i && children[i - 1] >= id; i--){
                            if (children[i - 1] == id) {
                                let idx=children[0]+ i - 1;
                                children.splice(idx,1);
                                break;
                            }
                        }
                }

                this.words[id].head = head;
                this.words[id].deprel = deprel;
                if (head >= 0) {
                    let children =this. words[head].children;
                    let i = children.length;
                    while (i && children[i - 1] > id) i--;
                    if (!i || children[i - 1] < id){
                        let idx=children[0]+ i ;
                        children.splice(idx,0, id);
                    } 
                }
            }

        }
    }

    unlinkAllWords() {
        for (let word of this. words) {
            word.head = -1;
            word.deprel="";
            word.children=[];
        }
    }

    removeComment(name:string){
        let idx=this.comments.findIndex(x=>/^#/.test(x)&&(new RegExp(name,"gi")).test(x));
        if(idx>=0){
            this.comments.splice(idx,1);
        }
    }
    setComment(name:string, value:string){
        let cmt="# "+name+" = ";
        value=(value+"").replace("\n","").replace("\r","");
        cmt+=value;
        this.comments.push(cmt);
    }

    getComment(name:string) :string {
        let value="";
        for (let comment of this. comments)
            if (comment[0] == '#') {
               let splt=comment.split("=")
               let left=splt.shift();
               let re=new RegExp(name,"gi");
               if(re.test(left)){
                value=splt.pop().trim();
                break;
               }
            }
        return value;
    }

    setText(text:string ) {
        this.removeComment("text");
        if (text)
        this.setComment("text", text);
    }

    setSentId(id:string ) {
        this.removeComment("sent_id");
        if (id)
        this.setComment("sent_id", id);
    }

    getSentId() :string {
        return this.getComment("sent_id");
    }

    getNewPar():string {
        let id= this.getComment("newpar id");
         if (!id)
             id=this.getComment("newpar");
         return id;
     }
     setNewDoc(  newdoc:boolean,id:string) {
        this.removeComment("newdoc");
        this.removeComment("newdoc id");

        if (newdoc && id)
                this.setComment("newdoc id", id);
        else if (newdoc)
             this.setComment("newdoc","");
    }
    getNewDoc():string {
        let id= this.getComment("newdoc id");
        if (!id)
            id= this.getComment("newdoc")
        return  id;
    }
    setNewPar( newpar:boolean,  id:string) {
        this.removeComment("newpar");
        this.removeComment("newpar id");
        if (newpar && id)
            this.setComment("newpar id", id);
        else if (newpar)
            this.setComment("newpar","");
    }

}