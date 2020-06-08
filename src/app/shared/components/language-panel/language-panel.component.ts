import { Component,Input ,OnInit,Output ,EventEmitter,ElementRef, ViewChild} from '@angular/core';
import { ConlluLanguageModel } from '../../../model/conllu-language-model';

import { ElectronHelperService } from '../../../services/electron-helper-service';

import { ConlluModel } from '../../../model/conllu-model';
import { TrainModel } from '../../../model/train-model';

import { DocumentManagementService } from '../../../../management/document-management-service';
import { LanguageManagementService } from '../../../../management/language-management-service';

@Component({
  selector: 'app-language-panel',
  templateUrl: './language-panel.component.html',
  styleUrls: ['./language-panel.component.scss']
})
export class LanguagePanelComponent implements OnInit {
  constructor(
     public documentService:DocumentManagementService,
     public electronservice:ElectronHelperService,
     public languageservice:LanguageManagementService,
     
     ) {}
  @Input() language:ConlluLanguageModel;
  @Input() languages:ConlluLanguageModel[];
  @Input() isTraining:boolean;

  @ViewChild('input1') inputEl:ElementRef;

  @Output() deleteLanguage = new EventEmitter();
  @Output() updateLanguage = new EventEmitter();

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


  OndeleteLanguage(){
    this.toggleMenu=false;
    this.deleteLanguage.emit();
  }
  OnUpdateLanguage(){
    this.toggleMenu=false;
    this.updateLanguage.emit();
  }



  togglePanel(){
   
    this.language.isExpanded=!this.language.isExpanded;
    if(this.language.isExpanded){

// let sptah="C:\\Users\\lakhd\\source\\repos\\PythonApplication1\\text_parser\\corpus.txt";
// this.documentService.importeTextFile(sptah,this.language.languageName,"corpus",	-2036688370).then(()=>{
// console.log("final")
// })


      this.documentService.get(this.language.languageName).then((files)=>{
        this.language.conlluFiles=(files||[]).map(item=>new ConlluModel(item));
        this.showSpinner=false;

            setTimeout(() => {
                this.documentService.getCounts(files,this.language.languageName,0,[]).then((newFiles)=>{
                    this.language.conlluFiles=(newFiles||[]).map(item=>new ConlluModel(item));
                }).catch(er=>this._showError(er,"getCounts"));
            
            }, 10);
      }).catch(er=>this._showError(er,"togglePanel"));
    }
  }



  importfile(){
    this.errorMsg="";
    //this.language.isExpanded=false;
    this.toggleMenu=false;
    this.showSpinner=true;
    try{
        this.electronservice.openfileDialog() .then( (files)=> {
            if (files &&files.filePaths) {
              let fl=files.filePaths[0];
              if(fl) {
                  this.documentService.importConlluFileStream(fl,this.language.guid,this.language.languageName).then((doc)=>{
                    this.language.isExpanded=false;
                      setTimeout(() => {
                        this.togglePanel();
                      }, 50);
                  }).catch(er=>this._showError(er));
                }else{
                  this.showSpinner=false;
                }
            }
        }).catch(er=>this._showError(er));
    }catch(er){
      this._showError(er);
    }
  }





  importUdpefile(){
    this.errorMsg="";
    this.showSpinner=true;
    this.language.isExpanded=false;
    this.toggleMenu=false;
      try{
       
        this.electronservice.openfileDialog(" trained .udpipe file","udpipe") .then( (files)=> {
            if (files &&files.filePaths) {
              let fl=files.filePaths[0];
              if(fl) {
                let lang=this.language.getLanguage()
                  this.documentService.importUDpipeFile(fl,lang).then((lng)=>{
                    this.language.udpeFile=lng.udpFile;
                    this.showSpinner=false;
                    this.language.isExpanded=true;
                  }).catch(er=>this._showError(er))
                }
            }
        }).catch(er=>this._showError(er));
      }catch(er){
        this._showError(er);
      }
  }


  createFile(){
    this.currentFile=new ConlluModel(null);
    this.currentFile.languageId=this.language.guid;
    this.showCreateFileDialog=true;
    this.toggleMenu=false;
    if(!this.language.isExpanded)this.togglePanel();
  }
  cancelCreateFile(){
    this.currentFile=undefined;
    this.showCreateFileDialog=false;
    this.errorMsg="";
  }
  confirmCreatefile(){
    this.errorMsg="";
    if(!this.currentFile.fileName){
      this.errorMsg="File name is required";
      return;
    }
 
    try{
      this.errorMsg="";
      this.showSpinner=true;
      let file=this.currentFile.getDocument();
      this.documentService.create(file,this.language.languageName).then(()=>{
        this.language.isExpanded=false;
          setTimeout(() => {
            this.togglePanel();
            this.currentFile=undefined;
            this.showCreateFileDialog=false;
        }, 20);
      }).catch(er=>this._showError(er,"Createfile"));
    }catch(er){
      this._showError(er);
    }
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
    this.language.isExpanded=false;
    let file=this.currentFile.getDocument();
    try{
      this.documentService.delete(file,this.language.languageName).then(arg=>{
        setTimeout(() => {
          this.togglePanel();
          this.currentFile=undefined;
          this.showDeleteFileDialog=false;
          this.showSpinner=false;
      }, 20);
      }).catch(er=>this._showError(er,"delete"));
    }catch(er){
      this._showError(er);
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
      this.language.isExpanded=true;
      let file=this.currentFile.getDocument();
      this.documentService.moveConlluFile(file,this.language.languageName,this.destinationLanguage.languageName,this.destinationLanguage.guid).then(()=>{
          this.destinationLanguage.conlluFiles.push(this.currentFile);
          this.destinationLanguage.isExpanded=true;;
          this.currentFile=undefined;
          this.showMoveFileDialog=false;
          this.showSpinner=false;
          this.language.isExpanded=false;
          this.destinationLanguage.isExpanded=true;
      }).catch(er=>this._showError(er,"Movefile"));
      
    }catch(er){
      this._showError(er);
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
      this.languageservice.trainUDPipeAutoTagger(this.trainModel)
      .then(()=>{ 
        this.showTrainDialog=false;
      }).catch((er)=>{
        console.error("trainUError",er);
        this.errorMsg=er;
      }) 
    }catch(er){
      console.error("confirmTrainfile",er);
      this.errorMsg=er;
    }
}

   
  _showError(er,action?:string){
    console.error(er)
    this.errorMsg=er;
    this.showSpinner=false;
   }

}
