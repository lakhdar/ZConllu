import * as fs from 'fs';
import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
  })
export class JsonUoW{
    constructor() {
    }

    readjson(srcPath){
        let ret=null;
        if(fs.existsSync(srcPath)){
          let str=fs.readFileSync(srcPath, 'utf8') ;
          ret=JSON.parse(str);
        }
      return ret;
      }
      
      writejson(srcPath,json){
        let str=JSON.stringify(json);
        fs.writeFileSync(srcPath,str,{encoding:'utf8',flag:'w'})
      }
}