import { Component,Input ,OnInit,Output ,EventEmitter,ElementRef, ViewChild} from '@angular/core';
import { ConlluLanguageModel } from '../../../model/conllu-language-model';
import { ConlluDataService } from '../../../services/conllu-data-service';
import { ConlluModel } from '../../../model/conllu-model';
import { TrainModel } from '../../../model/train-model';


@Component({
  selector: 'app-language-panel',
  templateUrl: './language-panel.component.html',
  styleUrls: ['./language-panel.component.scss']
})
export class LanguagePanelComponent implements OnInit {
  constructor(public service: ConlluDataService) {}
  @Input()language:ConlluLanguageModel;
  @Input()languages:ConlluLanguageModel[];
  @ViewChild('input1') inputEl:ElementRef;
  @Output() deleteLanguage = new EventEmitter();
  oldValue:string;
  errorMsg:string="";
  toggleMenu:boolean;
  showDeleteFileDialog:boolean;
  showMoveFileDialog:boolean;
  showSpinner:boolean;
  currentFile:ConlluModel;
  selectedLanguageName:string;
  showCreateFileDialog:boolean;
  showTrainDialog:boolean;
  trainModel:TrainModel;
  

  get destinationLanguage():ConlluLanguageModel{
    return (this.languages).filter(item=>item.languageName==this.selectedLanguageName)[0];
  }
  set languageName(value:string){
    this.language.languageName=(value+"").toUpperCase();
  }
  get languageName():string{
    return (this.language||{languageName:""}).languageName;
  }
  get otherlanguages():ConlluLanguageModel[]{
    return (this.languages).filter(item=>item.languageName!=this.language.languageName);
  }
 
  ngOnInit(): void {
    this.toggleMenu=false;
    this.showSpinner=false;
    this.oldValue=this.languageName;
    if(this.language.isPrestine){
        setTimeout(()=>{this.inputEl.nativeElement.focus()} ,250);
      }
  }

 












  renamelanguage(){
    this.errorMsg="";
    this.language.isPrestine=false;
    try{
      this.service.renameLanguage(this.language,this.oldValue).subscribe(()=>{
        this.oldValue=this.language.languageName;
      });
    }catch(er){
      console.error(er)
      this.errorMsg=er;
      this.language.languageName=this.oldValue;
    }
  }

  OndeleteLanguage(){
    this.toggleMenu=false;
    this.deleteLanguage.emit();
  }
  

  importfile(){
    this.errorMsg="";
    this.showSpinner=true;
    try{
      this.toggleMenu=false;
      this.language.isExpanded=false;
      this.service.importFile(this.language)
        .then(()=>{
          this.language.isExpanded=true;
          this.showSpinner=false;
        }).catch(er=>{
          console.error(er)
          this.errorMsg=er;
          this.showSpinner=false;
        });
    }catch(er){
      console.error(er)
      this.errorMsg=er;
      this.showSpinner=false;
    }
  }
  importUdpefile(){
    this.errorMsg="";
    this.showSpinner=true;
    try{
      this.toggleMenu=false;
      this.language.isExpanded=false;
      this.service.importUdpeFile(this.language)
        .then((obs)=>{
           
          this.language.isExpanded=true;
          this.showSpinner=false;
          if(obs&&obs.subscribe){
            obs.subscribe(lang=>{
              this.language.udpeFile=lang.udpeFile;
            })
           }
        }).catch(er=>{
          console.error(er)
          this.errorMsg=er;
          this.showSpinner=false;
        });
    }catch(er){
      console.error(er)
      this.errorMsg=er;
      this.showSpinner=false;
    }
  }


  createFile(){
    this.currentFile=new ConlluModel("");
    this.showCreateFileDialog=true;
    this.toggleMenu=false;
  }
  cancelCreateFile(){
    this.currentFile=undefined;
    this.showCreateFileDialog=false;
  }
  confirmCreatefile(){
    this.errorMsg="";
    if(!this.currentFile.fileName){
      this.errorMsg="File name is required";
      return;
    }

    try{
      this.language.isExpanded=false;
      this.service.createNewFile(this.language,this.currentFile).subscribe(lang=>{
        this.currentFile=undefined;
        this.showCreateFileDialog=false;
        this.language.isExpanded=true;
        for(let fle of lang.conlluFiles){
          if(this.language.conlluFiles.findIndex(x=>x.fileName==fle.fileName)<0){
            this.language.conlluFiles.push(fle);
          }
        }
      })
    }catch(er){
      this.errorMsg=er;
      console.error(er);
    }
    
  }

  toggleEditInput(){
    this.language.isPrestine=!this.language.isPrestine;
    if(this.language.isPrestine)
        setTimeout(() => this.inputEl.nativeElement.focus());
  }


  



 

  deletefile(selectedFile:ConlluModel){
    this.currentFile=selectedFile;
    this.showDeleteFileDialog=true;
  }
 
  cancelDeletefile(){
    this.currentFile=undefined;
    this.showDeleteFileDialog=false;
    this.showSpinner=false;
    this.errorMsg="";
  }
  confirmDeletefile(){
    this.errorMsg="";
    this.showSpinner=true;
    try{
      this.service.deleteFile(this.language,this.currentFile.fileName).subscribe(arg=>{
        this._updateFiles(arg);
        this.currentFile=undefined;
        this.showDeleteFileDialog=false;
        this.showSpinner=false;
      })
    }catch(er){
      console.error(er)
      this.errorMsg=er;
      this.showSpinner=false;
    }
  }





  moveFile(selectedFile:ConlluModel){
    this.currentFile=selectedFile;
    this.toggleMenu=false;
    this.showMoveFileDialog=true;
    this.showSpinner=false;
    this.errorMsg="";
  }

  cancelMoveFile(){
    this.currentFile=undefined;
    this.showMoveFileDialog=false;
    this.showSpinner=false;
    this.errorMsg="";
  }

  confirmMovefile(){
    this.errorMsg="";
    this.showSpinner=true;
    if(!this.destinationLanguage){
      this.errorMsg="Destination language is required";
      return;
    }
    try{
      this.service.moveFile(this.currentFile,this.language,this.destinationLanguage).subscribe((args)=>{
          for(let lang of args||[]){
            if(lang.languageName==this.language.languageName){
                for(let fle of lang.conlluFiles){
                  let idx=this.language.conlluFiles.findIndex(x=>x.fileName==this.currentFile.fileName);
                  if(idx>=0){
                    this.language.conlluFiles.splice(idx,1);
                  }
                }
            }
          }
          this.destinationLanguage.conlluFiles.push(this.currentFile);
          this.currentFile=undefined;
          this.showMoveFileDialog=false;
          this.showSpinner=false;
          this.language.isExpanded=false;
          this.destinationLanguage.isExpanded=true;
      })
    }catch(er){
      console.error(er);
      this.errorMsg=er;
      this.showSpinner=false;
    }
}

train(){
  this.trainModel=new TrainModel(this.language);
  this.showTrainDialog=true;
  this.toggleMenu=false;
}
cancelTrainFile(){
  this.showTrainDialog=false;
}
confirmTrainfile(){
  this.errorMsg="";
    try{
      this.service.trainUDPipeAutoTagger(this.trainModel)
      .then(()=>{
        this.showTrainDialog=false;
      }).catch((er)=>{
        this.errorMsg=er;
      }) 
    }catch(er){
      this.errorMsg=er;
    }
    
}


  _updateFiles(lang:ConlluLanguageModel){
    
    for(let ob of lang.conlluFiles){
      if(this.language.conlluFiles.findIndex(x => x.fileName=== ob.fileName)<0){
          this.language.conlluFiles.push(ob);
      }
    }
  
    for(let i=0;i<this.language.conlluFiles.length;i++){
      let lng=this.language.conlluFiles[i].fileName;
      if(lang.conlluFiles.findIndex(x => x.fileName === lng)<0){
          this.language.conlluFiles.splice(i,1);
      }
    }
  }


}
