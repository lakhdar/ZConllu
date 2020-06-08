
import * as fs from 'fs';
import {methods,tokenizers} from "./enums";

export class UDModel  {
    DEFAULT:string;
    TOKENIZER_NORMALIZED_SPACES:string= "normalized_spaces";
    TOKENIZER_PRESEGMENTED:string= "presegmented";
    TOKENIZER_RANGES:string= "ranges";
    VERSION_LATEST :number= 3;
    version:number;
    _method:methods=methods.morphodita_parsito;
    _sentinel:number=127;
    hasTokenizer:boolean;
    tokenizerId:tokenizers;
    tokenizerVersion:number;
    
    constructor() {
    }

    getMethod(fd:any):number{
        var buffer = new Buffer(1);
        fs.readSync(fd,buffer,0,1,0)
        let ln=[...buffer][0];
        buffer = new Buffer(ln);
        fs.readSync(fd,buffer,0,ln,1);
        let method=buffer.toString();
        this._method=methods[method];
        return ln;
    }
    getVersion(fd:any,ln:number):number{
        let versionIndex=ln+1
        let buffer = new Buffer(1);
        fs.readSync(fd,buffer,0,1,versionIndex);
        this.version=[...buffer][0];
        return versionIndex;
    }

    getSentinel(fd:any,ln:number):number{
        let versionIndex=ln+1
        let buffer = new Buffer(1);
        fs.readSync(fd,buffer,0,1,versionIndex);
        this._sentinel=[...buffer][0];
        if(this._sentinel==127){
            versionIndex=this.getSentinel(fd,versionIndex);
        }else{
            this._sentinel=0;
        }
        return versionIndex;
    }

    getTokenizer(fd:any,ln:number):number{
        let versionIndex=ln+1
        let buffer = new Buffer(1);
        fs.readSync(fd,buffer,0,1,versionIndex);
        this.hasTokenizer=!!([...buffer][0]);
        if(this.hasTokenizer){
            versionIndex++;
            buffer = new Buffer(1);
            fs.readSync(fd,buffer,0,1,versionIndex);
            this.tokenizerId=([...buffer][0]);
            versionIndex++;
            buffer = new Buffer(1);
            fs.readSync(fd,buffer,0,1,versionIndex);
            this.tokenizerVersion=([...buffer][0]);
        }
        return versionIndex;
    }

    load(path:string) {
        let fd=fs.openSync(path,"r");
         let ln=this.getMethod(fd);
        if(this._method==methods.morphodita_parsito){
            ln=this.getVersion(fd,ln);
            if(this.version>1&&this.version<this.VERSION_LATEST){
                ln=this.getSentinel(fd,ln);
                if(this._sentinel==127){
                    ln=this.getTokenizer(fd,ln);
                }
            }
        }
    }

    
}