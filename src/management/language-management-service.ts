import { Injectable } from '@angular/core';
import{LanguageRepository}from "../data/repositories/language-repoistory";
import{FSDocumentRepository}from "../data/repositories/fs-document-repository";
import{Language}from "../domain/language";
import{TrainArgs}from "../domain/train-args";

@Injectable({
    providedIn: 'root'
  })

export class LanguageManagementService{
    constructor(public repository: LanguageRepository, public fsRepository:FSDocumentRepository) {
     }

    get(skip?:number,take?:number):Promise<Language[]>{
        return this.repository.get(skip,take);
    }

    getById(guid:number):Promise<Language>{
        if(!guid)
            throw new Error("guid is required")
        return this.repository.getById(guid);
    }

    create(lang:Language):Promise<any>{
        if(!lang||!lang.name)
            throw new Error("Language is required")
        this.repository.createLanguagepath(lang);
        return this.repository.create(lang);
    }

    update(lang:Language):Promise<any>{
        if(!lang||!lang.name||!lang.guid)
            throw new Error("Language is required");
        lang.lastUpdateDate=new Date();
        return this.repository.update(lang);
    }

    delete(lang:Language):Promise<any>{
        if(!lang||!lang.name||!lang.guid)
            throw new Error("Language is required")
        this.repository.deleteLanguagepath(lang);
        return this.repository.delete(lang);
    }

    trainUDPipeAutoTagger(model:TrainArgs):Promise<any>{
        if(!model)
          throw new Error("TrainModel is required");
        if(!model.currentDevFileName)
          throw new Error("Testing file is required");
        if(!model.currentTrainFileName) 
          throw new Error("Train file is required");
        if(!model.languageName)
          throw new Error("Language name should be iso two letters name:"+model.languageName);
      
        let languageDirePath=this.fsRepository.getPath([model.languageName]);
        if(!this.fsRepository.exists(languageDirePath))
            throw new Error("Language directory not found for: "+model.languageName);
      
        let udpeFilePath=this.fsRepository.getPath([model.languageName,"model.udpipe"]);
        model.currentTrainFileName=this.fsRepository.getPath([model.languageName,model.currentTrainFileName+".conllu"]);
        model.currentDevFileName=this.fsRepository.getPath([model.languageName,  model.currentDevFileName+".conllu"]);
        return new Promise((resolve,reject)=>
            setTimeout(() => {
                      setTimeout(resolve, 2000);
                        try{
                            this.repository.trainUDPipeAutoTagger(model,udpeFilePath);
                      }catch(er){
                        reject.call(null,er)
                      }
              }, 20)
           ) 
      }

      isTraining(){
        return  this.repository.isTraining();
    }
    hasUDpipeeFile(lang:Language):boolean{
      return this.repository.hasUDpipeeFile(lang);
    }
}