import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConlluModel } from '../model/conllu-model';
import { AppSettingsService } from './app-settings-service';
import { ConlluBlock,ConlluSentence,ConlluLine} from '../model/conllu-detail-model';
import { ConlluLanguageModel } from '../model/conllu-language-model';
import { ElectronHelperService } from './electron-helper-service';
import { UDPipeService } from './udpipe-service';
import { TrainModel } from '../model/train-model';

@Injectable({
  providedIn: 'root'
})
export class LocalStoreService {

  constructor(public settings :AppSettingsService,public service:ElectronHelperService,public udpipeservice:UDPipeService) {}
 



trainUDPipeAutoTagger(model:TrainModel):Promise<any>{
  if(!model)
    throw new Error("TrainModel is required");
  if(!model.currentDevFileName)
    throw new Error("Testing file is required");
  if(!model.currentTrainFileName)
    throw new Error("Train file is required");
  if(!model.languageName||model.languageName.length>=3)
    throw new Error("Language name should be iso two letters name:"+model.languageName);


  let languageDirePath=this.service.getPath([model.languageName]);
  if(!this.service.exists(languageDirePath))
      throw new Error("Language directory not found for: "+model.languageName);

  let udpeFilePath=this.service.getPath([model.languageName,"model.udpipe"]);

  return new Promise((resolve,reject)=>
      setTimeout(() => {
                setTimeout(resolve, 2000);
                  try{
                      this.udpipeservice.trainUDPipeAutoTagger(model,udpeFilePath);
                }catch(er){
                  reject.call(null,er)
                }
        }, 20)
     ) 
}

getLanguages():Observable<Array<ConlluLanguageModel>>{
  let json= this._getJsonDB();
  return new Observable<Array<ConlluLanguageModel>>((subscriber) => subscriber.next(json));
}
getLanguage(name:string):Observable<ConlluLanguageModel>{
  let json= this._getJsonDB();
  let lang=(json||[]).filter(item=>item.languageName==name)[0];
  return new Observable<ConlluLanguageModel>((subscriber) => subscriber.next(lang));
}

createLanguage(lang:ConlluLanguageModel):Observable<Array<ConlluLanguageModel>>{
  if(!lang||!lang.languageName||lang.languageName.length>=3)
    throw new Error("Language name should be iso two letters name:"+lang.languageName);
  let strPath=this.service.getPath([lang.languageName]);
  if(this.service.exists(strPath))
    throw new Error("Language Already exists:"+lang.languageName);
  this.service.createDireIfNotExiste(strPath);
  let langs=this._saveLanguage(lang,true);
  return new Observable<Array<ConlluLanguageModel>>((subscriber) => subscriber.next(langs));
}

deleteLanguage(lang:ConlluLanguageModel):Observable<Array<ConlluLanguageModel>>{
  if(!lang||!lang.languageName||lang.languageName.length>=3)
    throw new Error("Language name should be iso two letters name:"+lang.languageName);
  
  let strPath=this.service.getPath([lang.languageName]);
  if(this.service.exists(strPath)){
    this.service.removeDire(strPath);
  }
  
  let json=this._getJsonDB()||[] ;
  let langs=(json||[]).filter(item=>item.languageName!=lang.languageName);
  this._writeJsonDB(langs);
  return new Observable<Array<ConlluLanguageModel>>((subscriber) => subscriber.next(langs));
}


renameLanguage(lang:ConlluLanguageModel,oldName:string):Observable<Array<ConlluLanguageModel>>{
  if(!lang||!lang.languageName||lang.languageName.length>=3)
    throw new Error("Language name should be iso two letters name:"+lang.languageName);
  if(!oldName||oldName.length>=3)
      throw new Error("Language name should be iso two letters name:"+oldName);
  
  let oldLanguagePath=this.service.getPath([oldName]);
  let newLanguagePath=this.service.getPath([lang.languageName]);
  if(!this.service.exists(oldLanguagePath)){
    throw new Error(oldName+" Language does not exists");
  }
  if(this.service.exists(newLanguagePath)){
      throw new Error(lang.languageName+" Language Already eexists");
  }
  this.service.createDireIfNotExiste(newLanguagePath);
  this.service.moveDire(oldLanguagePath,newLanguagePath);
  this.service.removeDire(oldLanguagePath);
  let json=this._getJsonDB()||[] ;
  
  let langs=(json||[]).filter(item=>item.languageName!=oldName);
  lang.lastUpdateDate=new Date();
  langs.push(lang);
  this._writeJsonDB(langs);

  return new Observable<Array<ConlluLanguageModel>>((subscriber) => subscriber.next(langs));
}


updateLanguages(languages:ConlluLanguageModel[]):Observable<Array<ConlluLanguageModel>>{
  let json=this._getJsonDB();
  let langs=(json||[]).filter(item=>languages.findIndex(x=>x.languageName==item.languageName)<0);
  for(let lang of languages||[]){
    lang.lastUpdateDate=new Date();
    langs.push(lang);
  }
  this._writeJsonDB(langs);
  return new Observable<Array<ConlluLanguageModel>>((subscriber) => subscriber.next(langs));
}

deleteFile(lang:ConlluLanguageModel,filename:string):Observable<ConlluLanguageModel>{
  if(!lang||!lang.languageName||lang.languageName.length>=3)
       throw new Error("Language name should be iso two letters name:"+lang?.languageName);
  if(!filename)
    throw new Error("file name is required:"+filename);

  let localDirPath=this.service.getPath([lang.languageName,filename]);
   
  if(!this.service.exists(localDirPath))
    throw new Error("File not found: "+localDirPath);

  this.service.removeDire(localDirPath);
  lang.conlluFiles=(lang.conlluFiles||[]).filter(item=>item.fileName!=filename);
  let json=this._getJsonDB()||[] ;
  let langs=(json||[]).filter(item=>item.languageName!=lang.languageName)||[] ;
  lang.lastUpdateDate=new Date();
  langs.push(lang)
  this._writeJsonDB(langs);
  return new Observable<ConlluLanguageModel>((subscriber) => subscriber.next(lang));
}

moveFile(file:ConlluModel,srclang:ConlluLanguageModel,destlang:ConlluLanguageModel):Observable<Array<ConlluLanguageModel>>{
  if(!srclang||!srclang.languageName||srclang.languageName.length>=3)
      throw new Error("source Language name should be iso two letters name:"+srclang?.languageName);
  if(!destlang||!destlang.languageName||destlang.languageName.length>=3)
      throw new Error("source Language name should be iso two letters name:"+destlang?.languageName);
  if(!file||!file.fileName)
      throw new Error("source Language name should be iso two letters name:"+file?.fileName);

  let srcLangPath=this.service.getPath([srclang.languageName]);
  if(!this.service.exists(srcLangPath))
      throw new Error(srclang.languageName+" File not found: ");

  let destLangPath=this.service.getPath([destlang.languageName]);
  if(!this.service.exists(destLangPath))
      throw new Error(destlang.languageName+"  not found: ");
  
  let srcConlluFilepath=this.service.getPath([srclang.languageName,file.fileName]);
  if(!this.service.exists(srcConlluFilepath))
     throw new Error(file.fileName+" File not found: "+srclang.languageName+"\\"+file.fileName);
  
  let destConlluFilepath=this.service.getPath([destlang.languageName,file.fileName]);
  if(this.service.exists(destConlluFilepath))
     throw new Error(file.fileName+" Already exists in destination: "+destlang?.languageName);

  this.service.moveDire(srcConlluFilepath,destConlluFilepath);
  this.service.removeDire(srcConlluFilepath);
  let JsonDb=this._getJsonDB()||[] ;
  file.lastUpdateDate=new Date();
  for(let lng of JsonDb){
    if(lng.languageName==srclang.languageName){
      lng.conlluFiles=(srclang.conlluFiles||[]).filter(x=>x.fileName!=file.fileName);
      lng.lastUpdateDate=new Date();
    }
    if(lng.languageName==destlang.languageName){
      lng.conlluFiles.push(file);
      lng.lastUpdateDate=new Date();
    }
  }
  this._writeJsonDB(JsonDb);
  return new Observable<Array<ConlluLanguageModel>>((subscriber) => subscriber.next(JsonDb));
 
}


getPage(langName,fileName,page):Observable<Array<ConlluSentence>>{
  if(!langName||langName.length>=3)
    throw new Error("source Language name should be iso two letters name:"+langName);
  if(!fileName)
    throw new Error("File name is required"+fileName);
  page=page||1;
  let localFileName=this.service.getFileNamewithOutExtension(fileName);
  let pageFileName=this.settings.pageName+""+page+".json";
  let pagePath=this.service.getPath([langName,localFileName,pageFileName]);
  if(!this.service.exists(pagePath))
     throw new Error("Page not found "+pagePath);
  let json= this.service.readjson(pagePath) ||[] as Array<ConlluSentence>;

  return new Observable<Array<ConlluSentence>>((subscriber) => subscriber.next(json));
}

getSentence(langName:string,fileName:string,sentId:string,page:number):Observable<ConlluSentence>{
  if(!langName||langName.length>=3)
    throw new Error("source Language name should be iso two letters name:"+langName);
  if(!fileName)
    throw new Error("File name is required "+fileName);
  if(!sentId)
    throw new Error("sentId  is required "+sentId);
  if(!page)
    throw new Error("page  is required "+page);
  let pageFileName=this.settings.pageName+""+page+".json";
  let pagePath=this.service.getPath([langName,fileName,pageFileName]);
  if(!this.service.exists(pagePath))
      throw new Error("Page not found "+pagePath);
  let json=this.service.readjson(pagePath)||[]  as Array<ConlluSentence>;
  let sent=json.find(x=>x.sentId==sentId);
  return new Observable<ConlluSentence>((subscriber) => subscriber.next(sent));
}

deleteSentece(langName:string,fileName:string,sentId:string,page:number):Observable<Array<ConlluSentence>>{
  if(!langName||langName.length>=3)
    throw new Error("source Language name should be iso two letters name:"+langName);
  if(!fileName)
    throw new Error("File name is required "+fileName);
  if(!sentId)
    throw new Error("sentId  is required "+sentId);
  if(!page)
    throw new Error("page  is required "+page);
  let pageFileName=this.settings.pageName+""+page+".json";
  let pagePath=this.service.getPath([langName,fileName,pageFileName]);
  if(!this.service.exists(pagePath))
      throw new Error("Page not found "+pagePath);

  let json=this.service.readjson(pagePath)||[]  as Array<ConlluSentence>;
  let sents=(json||[]).filter(item=>item.sentId!=sentId);
  this.service.writejson(pagePath,sents);
  this.swapePages(langName,fileName);
  let JsonDb=this._getJsonDB()||[] ;

  for(let lng of JsonDb){
    if(lng.languageName==langName){
      lng.lastUpdateDate=new Date();
      for(let fle of lng.conlluFiles){
        if(fle.fileName==fileName){
          fle.totalsents--;
          fle.lastUpdateDate=new Date();
        }
      }
    }
  }
  this._writeJsonDB(JsonDb);
  json=this.service.readjson(pagePath) as Array<ConlluSentence>;
  return new Observable<Array<ConlluSentence>>((subscriber) => subscriber.next(json));
}

addSentence(sentence:ConlluSentence,langName:string,fileName:string,page:number):Observable<Array<ConlluSentence>>{

  if(!sentence)
    throw new Error("sentence  is required ");
  if(!sentence.text)
    throw new Error("sentence text is required ");
  if(!langName||langName.length>=3)
    throw new Error("source Language name should be iso two letters name:"+langName);
  if(!fileName)
    throw new Error("File name is required "+fileName);
  if(!page)
    throw new Error("page  is required "+page);
  let pageFileName=this.settings.pageName+""+page+".json";
  let pagePath=this.service.getPath([langName,fileName,pageFileName]);
  if(!this.service.exists(pagePath))
      throw new Error("Page not found "+pagePath);

  let json=(this.service.readjson(pagePath)||[] )as Array<ConlluSentence>;
  let existsentence=(json||[]).filter(item=>item.sentId==sentence.sentId)[0];

  if(existsentence)
      throw new Error("sentence already exists "+existsentence.sentId);
  
  let hasUDpipe=false;
  let JsonDb=this._getJsonDB()||[];
  for(let lng of JsonDb){
    if(lng.languageName==langName){
      hasUDpipe=!!lng.udpeFile;
      lng.lastUpdateDate=new Date();
      for(let fle of lng.conlluFiles){
        if(fle.fileName==fileName){
          fle.totalsents++;
        }
      }
    }
  }
  if(hasUDpipe){
    sentence=this.udpipeservice.parseSentence(sentence);
  }
  sentence.isExpnaded=false;
  json.push(sentence);
  this.service.writejson(pagePath,json);
  this.swapePages(langName,fileName);
  
  this._writeJsonDB(JsonDb);

  json=this.service.readjson(pagePath) as Array<ConlluSentence>;
  return new Observable<Array<ConlluSentence>>((subscriber) => subscriber.next(json));

}



updateSentence(sentence:ConlluSentence,langName:string,fileName:string,page:number):Observable<ConlluSentence>{
  console.log("updateSentence")
  if(!sentence)
    throw new Error("sentence  is required ");
  if(!sentence.text)
    throw new Error("sentence text is required ");
  if(!langName||langName.length>=3)
    throw new Error("source Language name should be iso two letters name:"+langName);
  if(!fileName)
    throw new Error("File name is required "+fileName);
  if(!page)
    throw new Error("page  is required "+page);
  let pageFileName=this.settings.pageName+""+page+".json";
  let pagePath=this.service.getPath([langName,fileName,pageFileName]);
  if(!this.service.exists(pagePath))
      throw new Error("Page not found "+pagePath);

  let json=this.service.readjson(pagePath) as Array<ConlluSentence>;
 
  let sentences=(json||[]).filter(item=>item.sentId!=sentence.sentId);
  sentence.isExpnaded=false;
  sentence.lastUpdateDate=new Date();
  sentences.push(sentence);
  this.service.writejson(pagePath,sentences)
  return new Observable<ConlluSentence>((subscriber) => subscriber.next(sentence));
}

deleteLine(sentence:ConlluSentence,langName:string,fileName:string,lineId:number,page:number):Observable<ConlluSentence>{
  if(!langName||langName.length>=3)
    throw new Error("source Language name should be iso two letters name:"+langName);
  if(!fileName)
    throw new Error("File name is required "+fileName);
  if(!sentence)
    throw new Error("sentId  is required ");
  if(!lineId)
    throw new Error("lineId  is required "+lineId);
  if(!page)
    throw new Error("page  is required "+page);
  let pageFileName=this.settings.pageName+""+page+".json";
  let pagePath=this.service.getPath([langName,fileName,pageFileName]);
  if(!this.service.exists(pagePath))
      throw new Error("Page not found "+pagePath);

  let json=this.service.readjson(pagePath) as Array<ConlluSentence>;
  let sentences=(json||[]).filter(item=>item.sentId!=sentence.sentId);
  let lineIndex=(sentence.lines||[]).findIndex(x=>x.index==lineId);
  if(lineIndex>=0){
    sentence.lines.splice(lineIndex,1);
  }
  sentences.push(sentence);
  this.service.writejson(pagePath,sentences);
  return new Observable<ConlluSentence>((subscriber) => subscriber.next(sentence));
}
addLine(line:ConlluLine,sentence:ConlluSentence,langName:string,fileName:string,page:number):Observable<ConlluSentence>{
  if(!line)
    throw new Error("line  is required ");
  this._validateline(line);
  if(!sentence)
    throw new Error("sentence  is required ");
  if(!sentence.text)
    throw new Error("sentence text is required ");
  if(!langName||langName.length>=3)
    throw new Error("source Language name should be iso two letters name:"+langName);
  if(!fileName)
    throw new Error("File name is required "+fileName);
  if(!page)
    throw new Error("page  is required "+page);
  let pageFileName=this.settings.pageName+""+page+".json";
  let pagePath=this.service.getPath([langName,fileName,pageFileName]);
  if(!this.service.exists(pagePath))
    throw new Error("Page not found "+pagePath);
  let json=this.service.readjson(pagePath) as Array<ConlluSentence>;
  for(let sen of json){
    if(sen.sentId==sentence.sentId){
      let idx=+line.index-1;
      sen.lines.splice(idx,0,line);
      sen.lastUpdateDate=new Date();
      sentence=sen;
    }
  }
  this.service.writejson(pagePath,json)
  return new Observable<ConlluSentence>((subscriber) => subscriber.next(sentence));
}

updateLine(line:ConlluLine,sentence:ConlluSentence,langName:string,fileName:string,page:number):Observable<ConlluSentence>{
  if(!line)
      throw new Error("line  is required ");
  this._validateline(line);
  if(!sentence)
    throw new Error("sentence  is required ");
  if(!sentence.text)
    throw new Error("sentence text is required ");
  if(!langName||langName.length>=3)
    throw new Error("source Language name should be iso two letters name:"+langName);
  if(!fileName)
    throw new Error("File name is required "+fileName);
  if(!page)
    throw new Error("page  is required "+page);
  let pageFileName=this.settings.pageName+""+page+".json";
  let pagePath=this.service.getPath([langName,fileName,pageFileName]);
  if(!this.service.exists(pagePath))
      throw new Error("Page not found "+pagePath);

  let json=this.service.readjson(pagePath) as Array<ConlluSentence>;
  let sentences=(json||[]).filter(item=>item.sentId!=sentence.sentId);
  let lineIndex=(sentence.lines||[]).findIndex(x=>x.index==line.index);
  if(lineIndex>=0){
    sentence.lines.splice(lineIndex,1);
    line.lastUpdateDate=new Date();
    sentence.lines.splice(lineIndex,0,line);
  }
  sentence.isExpnaded=false;
  sentence.lastUpdateDate=new Date();
  sentences.push(sentence);
  this.service.writejson(pagePath,sentences)
  return new Observable<ConlluSentence>((subscriber) => subscriber.next(sentence));
}


swapePages(langName:string,fileName:string){
  if(!langName||langName.length>=3)
    throw new Error("source Language name should be iso two letters name:"+langName);
  if(!fileName)
    throw new Error("File name is required"+fileName);
  let localFileName=this.service.getFileNamewithOutExtension(fileName);
  let pagePath=this.service.getPath([langName,localFileName]);  
  if(!this.service.exists(pagePath))
    throw new Error("File not found "+pagePath);
  let page=1;
  this._swapePage(pagePath,page);
}

_swapePage(languageFilePath:string,page:number){
  let pageFileName=this.settings.pageName;
  let pageFile=languageFilePath+"\\"+pageFileName+""+page+".json";
  let nextpageFile=languageFilePath+"\\"+pageFileName+""+(+page+1)+".json";
  let pageSize=+this.settings.pageSize;
  let jsonnext=[];
  let json=[];
  if(this.service.exists(pageFile)){
    json=(this.service.readjson(pageFile)||[]).sort(this.sortSents) as Array<ConlluSentence>;
    if(json.length>pageSize){
      let lnToRemove=+json.length-pageSize;
      let toRemove=json.splice((+pageSize),lnToRemove);
      if(this.service.exists(nextpageFile)){
        jsonnext=(this.service.readjson(nextpageFile)||[]).sort(this.sortSents) as Array<ConlluSentence>;
      }
      jsonnext=jsonnext.concat(toRemove);
      this.service.writejson(pageFile,json)
      this.service.writejson(nextpageFile,jsonnext)

    }else if(json.length<pageSize){
      if(this.service.exists(nextpageFile)){
        jsonnext=(this.service.readjson(nextpageFile)||[]).sort(this.sortSents) as Array<ConlluSentence>;
        let lnRemove=+pageSize-json.length;
        let toRemoveIndex=jsonnext.length-lnRemove-1;
        let toAdd=jsonnext.splice(toRemoveIndex,lnRemove);
        json=json.concat(toAdd);
        this.service.writejson(pageFile,json)
        this.service.writejson(nextpageFile,jsonnext)
      }
    }
    page=+page+1
    this._swapePage(languageFilePath,page);
  }

}


createNewFile(lang:ConlluLanguageModel,currentFile:ConlluModel):Observable<ConlluLanguageModel>{
  if(!lang||!lang.languageName||lang.languageName.length>=3)
    throw new Error("Language name should be iso two letters name:"+lang.languageName);
  if(!currentFile||!currentFile.fileName)
    throw new Error("File name is required")
  let localFileName= this.service.getConlluFileNameWithExtension(currentFile.fileName);
  let localDirPath=this.service.getPath([lang.languageName,currentFile.fileName]);
  if(this.service.exists(localDirPath))
    throw new Error("File Already exists: "+currentFile.fileName);
  this.service.createDireIfNotExiste(localDirPath);

  let pagePath=localDirPath+"\\"+this.settings.pageName+"1.json";
  this.service.writejson(pagePath,"");
  let json=this._getJsonDB();
  let langs=(json||[]).filter(item=>item.languageName!=lang.languageName);
  lang.conlluFiles=(lang.conlluFiles||[]).filter(item=>item.fileName!=currentFile.fileName);
  if(!currentFile.fileId)
    currentFile.fileId=currentFile.fileName+"_ID_1";
  lang.conlluFiles.push(currentFile);
  lang.lastUpdateDate=new Date();
  langs.push(lang);
  this._writeJsonDB(langs);

  return new Observable<ConlluLanguageModel>((subscriber) => subscriber.next(lang));
}

importFile(lang:ConlluLanguageModel){
   return this.service.openfileDialog()
    .then( (files)=> {
      if (files &&files.filePaths) {
        let fl=files.filePaths[0];
        if(!fl)
            return ;
        this._importFile(lang,fl);
      }
  });
}



importUdpeFile(lang:ConlluLanguageModel){
  return this.service.openfileDialog("udpipe files","udpipe")
   .then( (files)=> {
     if (files &&files.filePaths) {
       let fl=files.filePaths[0];
       if(!fl)
           return ;
      return this._importUdpipeFile(lang,fl);
     }
 });
}

_importUdpipeFile(lang:ConlluLanguageModel,filePath:string):Observable<ConlluLanguageModel>{

  if(!lang||!lang.languageName||lang.languageName.length>=3)
    throw new Error("Language name should be iso two letters name:"+lang.languageName);
  if(!this.service.exists(filePath))
    throw new Error("File not found: "+filePath);
  let fileName=this.service.getFileName(filePath);
  if(!fileName.endsWith("udpipe"))
      new Error("Import only udpipe files "+filePath);
  let localFilePath=this.service.getPath([lang.languageName,fileName]);
  if(this.service.exists(localFilePath)){
    this.service.removeFile(localFilePath)
  }
  this.service.copyFile(filePath,localFilePath);
  let json=this._getJsonDB();
  let langs=(json||[]).filter(item=>item.languageName!=lang.languageName);
  lang.udpeFile=fileName;
  langs.push(lang);
  this._writeJsonDB(langs);
  return new Observable<ConlluLanguageModel>((subscriber) => subscriber.next(lang));
}



_importFile(lang:ConlluLanguageModel,filePath:string):Observable<ConlluLanguageModel>{
  if(!lang||!lang.languageName||lang.languageName.length>=3)
    throw new Error("Language name should be iso two letters name:"+lang.languageName);
  if(!this.service.exists(filePath))
      throw new Error("File not found: "+filePath);
  
  let localFileName=this.service.getFileName(filePath);
  if(!localFileName.endsWith("conllu"))
      new Error("Import only conllu files "+filePath);
  let localFileWithoutExt=this.service.getFileNamewithOutExtension(localFileName);
  let localDirPath=this.service.getPath([lang.languageName,localFileWithoutExt]);
  let localFilePath=this.service.getPath([lang.languageName,localFileWithoutExt,localFileName]);
  if(this.service.exists(localFilePath))
    throw new Error("File Already exists: "+localFileWithoutExt);

  this.service.createDireIfNotExiste(localDirPath);
  this.service.copyFile(filePath,localFilePath);
  let conllFile=this.parseFile(localDirPath,localFilePath);
  lang.conlluFiles=(lang.conlluFiles||[]).filter(item=>item.fileName!=localFileWithoutExt);

  lang.conlluFiles.push(conllFile);
  let json=this._getJsonDB();
  let langs=(json||[]).filter(item=>item.languageName!=lang.languageName);
  lang.lastUpdateDate=new Date();
  langs.push(lang);
  this._writeJsonDB(langs);

  return new Observable<ConlluLanguageModel>((subscriber) => subscriber.next(lang));
}




parseFile(localDirPath:string,conlluFilePath:string ):ConlluModel{
  if(!this.service.exists(conlluFilePath))
      throw new Error("File not found: "+conlluFilePath);
  let localFileWithoutExt=this.service.getFileNamewithOutExtension(conlluFilePath);
  let lre=this.service.getFileLines(conlluFilePath);
  let line="true";
  let sentCounter=-1,pageCounter=0;
  let model=new ConlluModel(localFileWithoutExt);
  let blocks:Array<ConlluBlock>=[];
  let currentblock=null;
  let blocksize=this.settings.pageSize;
  while(line){
    line=lre.readline();
    if(/^#/.test(line)){
      if(/^#\s+newdoc\s+id/.test(line)){
        model.fileId=line.split("=").pop().trim();
      }else{
        if(/^#\s+sent_id/.test(line)){
           currentblock=new ConlluBlock();
            currentblock.lines.push(line); 
        }
        if(/^#\s+text/.test(line)){
            currentblock.lines.push(line); 
            sentCounter++;
            if(blocks.length<blocksize){
              blocks.push(currentblock);
            }else{
              // save 
              pageCounter++;
              let tmpblk=[].concat(blocks);
              this._saveBlockPage(localDirPath,tmpblk,(pageCounter/1));
              blocks=[];
            }
        } 
      }
    }else if (currentblock&&/^\d/.test(line)){
      currentblock.lines.push(line); 
    }
  }

  if(blocks.length<blocksize&&blocks.length>0){
    pageCounter++
    this._saveBlockPage(localDirPath,blocks,(pageCounter));
  }
  model.totalsents=sentCounter;
  return model;
}


_saveBlockPage(path:string,blocks:Array<ConlluBlock>,page:number){

  let pagefile=this.settings.pageName+ page+".json";
  let pagePath=path+"\\"+pagefile;
  let sents:Array<ConlluSentence>=[];
  for(let block of blocks){
    let sent=new ConlluSentence(block.lines);
    sents.push(sent);
  }
  this.service.writejson(pagePath,sents);
}




_validateline(line:ConlluLine){
  if(!line.index)
    throw new Error("Index is Required");
  if(!line.word)
    throw new Error("word is Required");
  if(!line.lemma)
    throw new Error("LEMMA is Required");
  if(!line.POS)
    line.POS="_";
  if(!line.XPOS)
    line.XPOS="_";
  if(!line.FEATS)
    line.FEATS="_";
  if(!line.HEAD)
    line.HEAD="_";
  if(!line.DEPREL)
    line.DEPREL="_";
  if(!line.DEPS)
    line.DEPS="_";
  if(!line.MISC)
    line.MISC="_";
}

sortSents( a:ConlluSentence, b:ConlluSentence):number{
  let left=new Date(a.creationDate).getTime();
  let right=new Date(b.creationDate).getTime()
  return (left > right) ? -1 : (right > left) ? 1 : 0 ;

}





_getJsonDB(){
  let jsonDbPath=this.service.getPath([this.settings.jsonDBPath]);
  return  this.service.readjson(jsonDbPath) as Array<ConlluLanguageModel>;
}
_writeJsonDB(json:any,path?:string){
  let jsonDbPath=this.service.getPath([this.settings.jsonDBPath]);
  if(path){
    jsonDbPath=this.service.getPath([path]);
  }
  this.service.writejson(jsonDbPath,json);
}

_saveLanguage(lang:ConlluLanguageModel,bforAdd?:boolean):Array<ConlluLanguageModel>{
  let json=this._getJsonDB();
  let langs=(json||[]).filter(item=>item.languageName!=lang.languageName);
  if(bforAdd){
    langs.push(lang);
  }
  this._writeJsonDB(langs);
  return langs;
}

}
