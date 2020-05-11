import { Injectable } from '@angular/core';
import { AppSettingsService } from './app-settings-service';
import { ElectronHelperService } from './electron-helper-service';
import { WebStoreService } from './web-store-service';
import { LocalStoreService } from './local-store-service';
import { Observable } from 'rxjs';
import { ConlluModel } from '../model/conllu-model';
import { ConlluSentence ,ConlluLine} from '../model/conllu-detail-model';
import { ConlluLanguageModel } from '../model/conllu-language-model';
import { TrainModel } from '../model/train-model';


@Injectable({
  providedIn: 'root'
})
export class ConlluDataService {


  constructor(public loacalService :LocalStoreService,public electronService :ElectronHelperService,public webService :WebStoreService) {}


  trainUDPipeAutoTagger(model:TrainModel):Promise<any>{
   if(this.electronService.isElectron){
      return  this.loacalService.trainUDPipeAutoTagger(model);
   }else{
      return null;
   }
  }

  getLanguages():Observable<Array<ConlluLanguageModel>>{
    if(this.electronService.isElectron){
       return  this.loacalService.getLanguages();
    }else{
       return null;
    }
  }
  getLanguage(name:string):Observable<ConlluLanguageModel>{
   if(this.electronService.isElectron){
      return  this.loacalService.getLanguage(name);
   }else{
      return null;
   }
 }

  createLanguage(lang:ConlluLanguageModel):Observable<Array<ConlluLanguageModel>>{
    if(this.electronService.isElectron){
       return  this.loacalService.createLanguage(lang);
    }else{
       return null;
    }
  }

  renameLanguage(lang:ConlluLanguageModel,oldname:string):Observable<Array<ConlluLanguageModel>>{
    if(this.electronService.isElectron){
       return  this.loacalService.renameLanguage(lang,oldname);
    }else{
       return null;
    }
  }

  deleteLanguage(lang:ConlluLanguageModel):Observable<Array<ConlluLanguageModel>>{
    if(this.electronService.isElectron){
       return  this.loacalService.deleteLanguage(lang);
    }else{
       return null;
    }
  }
  updateLanguages(languages:ConlluLanguageModel[]):Observable<Array<ConlluLanguageModel>>{

    if(this.electronService.isElectron){
      return  this.loacalService.updateLanguages(languages);
   }else{
      return null;
   }
  }


  deleteFile(lang:ConlluLanguageModel,filename:string):Observable<ConlluLanguageModel>{
    if(this.electronService.isElectron){
      return  this.loacalService.deleteFile(lang,filename);
   }else{
      return null;
   }
  }

  moveFile(file:ConlluModel,srclang:ConlluLanguageModel,destlang:ConlluLanguageModel):Observable<Array<ConlluLanguageModel>>{
    if(this.electronService.isElectron){
      return  this.loacalService.moveFile(file,srclang,destlang);
   }else{
      return null;
   }

  }

  importUdpeFile(lang:ConlluLanguageModel){
   if(this.electronService.isElectron){
      return  this.loacalService.importUdpeFile(lang);
   }else{
      return null;
   }
  }

  importFile(lang:ConlluLanguageModel){
   if(this.electronService.isElectron){
      return  this.loacalService.importFile(lang);
   }else{
      return null;
   }
  }
  createNewFile(lang:ConlluLanguageModel,currentFile:ConlluModel):Observable<ConlluLanguageModel>{
   if(this.electronService.isElectron){
      return  this.loacalService.createNewFile(lang,currentFile);
   }else{
      return null;
   }
  }

  getPage(langName,fileName,page):Observable<Array<ConlluSentence>>{
   if(this.electronService.isElectron){
      return  this.loacalService.getPage(langName,fileName,page);
   }else{
      return null;
   }
  }

  getSentence(langName:string,fileName:string,sentId:string,page:number):Observable<ConlluSentence>{

   if(this.electronService.isElectron){
      return  this.loacalService.getSentence(langName,fileName,sentId,page);
   }else{
      return null;
   }
  }
  deleteSentece(langName:string,fileName:string,sentId:string,page:number):Observable<Array<ConlluSentence>>{
   if(this.electronService.isElectron){
      return  this.loacalService.deleteSentece(langName,fileName,sentId,page);
   }else{
      return null;
   }
  }
  addSentence(sentence:ConlluSentence,langName:string,fileName:string,page:number):Observable<Array<ConlluSentence>>{
   if(this.electronService.isElectron){
      return  this.loacalService.addSentence(sentence,langName,fileName,page);
   }else{
      return null;
   }
  }
  updateSentence(sentence:ConlluSentence,langName:string,fileName:string,page:number):Observable<ConlluSentence>{
   if(this.electronService.isElectron){
      return  this.loacalService.updateSentence(sentence,langName,fileName,page);
   }else{
      return null;
   }
  }



  deleteLine(sentence:ConlluSentence,langName:string,fileName:string,lineId:number,page:number):Observable<ConlluSentence>{
   if(this.electronService.isElectron){
      return  this.loacalService.deleteLine(sentence,langName,fileName,lineId,page);
   }else{
      return null;
   }
  }
  addLine(line:ConlluLine,sentence:ConlluSentence,langName:string,fileName:string,page:number):Observable<ConlluSentence>{
   if(this.electronService.isElectron){
      return  this.loacalService.addLine(line,sentence,langName,fileName,page);
   }else{
      return null;
   }
  }
  updateLine(line:ConlluLine,sentence:ConlluSentence,langName:string,fileName:string,page:number):Observable<ConlluSentence>{
      if(this.electronService.isElectron){
         return  this.loacalService.updateLine(line,sentence,langName,fileName,page);
      }else{
         return null;
      }

  }

  swapePages(langName:string,fileName:string){
   if(this.electronService.isElectron){
      return  this.loacalService.swapePages(langName,fileName);
   }else{
      return null;
   }
  }
  sortSents( a:ConlluSentence, b:ConlluSentence):number{
   return  this.loacalService.sortSents(a,b);
  }
}
