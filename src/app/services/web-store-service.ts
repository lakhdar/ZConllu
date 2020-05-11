import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConlluModel } from '../model/conllu-model';
import { AppSettingsService } from './app-settings-service';
import { ConlluDetailModel } from '../model/conllu-detail-model';
import { ConlluLanguageModel } from '../model/conllu-language-model';


@Injectable({
  providedIn: 'root'
})
export class WebStoreService {

  constructor(public settings :AppSettingsService) {}

getFileContent(name:string,skip:number,take:number):Observable<ConlluDetailModel>{
    console.log("not implemented");
    return null;
}

getConnllus():Observable<Array<ConlluLanguageModel>>{
  let languages:Array<ConlluLanguageModel>=[]
    let fls=[
      new ConlluModel("file-i-.conllu",12,55,20),
      new ConlluModel("file-y-.conllu",12,55,20),
      new ConlluModel("file-g-.conllu",12,55,20),
      new ConlluModel("file-u-.conllu",12,55,20)
  ]
  for(let fl of fls){
    let lng=new ConlluLanguageModel("zz");
    lng.conlluFiles.push(fl)
    languages.push(lng)
  }
  return  new Observable<Array<ConlluLanguageModel>>((subscriber) => subscriber.next(languages));
}
 

updateConllus():Observable<Array<ConlluLanguageModel>>{
  return this.getConnllus();
  
}
}
