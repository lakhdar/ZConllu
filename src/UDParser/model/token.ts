export class Token {
     constructor(public form:string,public misc:string) {}

     getMiscField(name:string):string{
        let str= (new RegExp("("+name+"=[^\|]*)","gi").exec(name)||[]).shift();
        return (str+"").split("=").pop();
     }

     getSpaceAfter():boolean{
        return /SpaceAfter=No/gi.test(this.misc)
       // return (/SpaceAfter=(\w+)/gi.exec(this.misc)||[]).findIndex(x=>/No/gi.test(x))>=0
     }
     getSpacesBefore():string{
        let spces="";
        let value=this.getMiscField("SpacesBefore");
        if (value)
            spces= this.unEscapeSpaces(value);
        return spces;
     }
     setSpacesBefore(spaces_before:string){
         if(!spaces_before)
            this.removeMiscField("SpacesBefore");
        else{
            this.startMiscField("SpacesBefore");
            this.misc+=this.appendEscapedSpaces(spaces_before);
        }

     }
     setSpacesAfter(spaces_after:string){
        if (spaces_after) {
            this.setSpaceAfter(false);
            this.removeMiscField("SpacesAfter");
          } else if (spaces_after.length == 1 && spaces_after[0] == ' ') {
            this.setSpaceAfter(true);
            this.removeMiscField("SpacesAfter");
          } else {
            this.setSpaceAfter(true);
            this.startMiscField("SpacesAfter");
            this.misc+=this.appendEscapedSpaces(spaces_after);
          }
     }
     getSpacesAfter():string{
        let spaces_after="";
        let value=this.getMiscField("SpacesAfter");
        if(value)
            spaces_after=this.unEscapeSpaces(value)
        else
        spaces_after=this.getSpaceAfter() ? " " : "";
        return spaces_after;
     }

     removeMiscField( name:string){
       let str= (new RegExp("("+name+"=[^\|]*)","gi").exec(name)||[]).shift();
       this.misc=(this.misc+"").replace(str,"");
     }
     startMiscField( name:string){
         if(this.misc)
                this.misc=this.misc+"|"
         this.misc=this.misc+name+"=";
     }
     setSpaceAfter( bForSpaceAfter:boolean){
        if(bForSpaceAfter){
            this.removeMiscField("SpaceAfter")
        }else {
            this.startMiscField("SpaceAfter")
            this.misc+"No";
        }
     }
     appendEscapedSpaces(escaped:string){
        let ret="";
        for (let i = 0; i < escaped.length; i++){
            switch (escaped[i]) {
            case ' ':
                ret+('\\s'); break;
            case '|':
                ret+'\\p'; break;
            case '\t':
                ret+'\\t';  break;
            case '\r':
                ret+'\\r';  break;
            case '\n':
                ret+'\\n';  break;
            case '\\':
                ret+'\\\\'; break;
            default:
                ret+escaped[i];
            }
        }
        return ret;
     }
    unEscapeSpaces(escaped:string):string{
      let ret="";
        for (let i = 0; i < escaped.length; i++){
            if (escaped[i] != '\\' || i+1 >= escaped.length){
                     ret+escaped[i];
            }else switch (escaped[++i]) {
                case 's':
                    ret+(' '); break;
                case 'p':
                    ret+('|'); break;
                case 't':
                    ret+('\t'); break;
                case 'r':
                    ret+('\r'); break;
                case 'n':
                    ret+('\n'); break;
                case '\\':
                    ret+('\\'); break;
                default:
                    ret+(escaped[i - 1]);
                    ret+(escaped[i]);
            }
        }
        return ret;
    }

    getSpacesInToken(){
        let token="";
        let value=this.getMiscField("SpacesInToken");
        if (value)
            token=this.unEscapeSpaces(value, );
        return token;
    }
    setSpacesInToken(spacesInToken:string){
        if (!spacesInToken)
            this.removeMiscField("SpacesInToken");
         else
            this.startMiscField("SpacesInToken")
            this.misc+=this. appendEscapedSpaces(spacesInToken);
    }
    getTokenRange():any{
        let value=this.getMiscField("TokenRange");
        let ret={start:-1,end:-1};
        if(value){
            let splt=value.split(":");
            let left=Array.from(splt.shift()+"").pop();
            let right=Array.from(splt.pop()+"").shift();
            ret.start=+left;
            ret.end=+right;
        }
       return ret;
    }
    setTokenRange(start:number, end:number) {
        if (start <0)
          this.removeMiscField("TokenRange");
        else{
            this.startMiscField("TokenRange");
            this.misc+=start+":"+end;
        }
      }
}