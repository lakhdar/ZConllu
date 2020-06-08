import { Component, OnInit } from '@angular/core';
import { ConlluLanguageModel } from '../model/conllu-language-model';
import { LanguageManagementService } from '../../management/language-management-service';
import { Language } from '../../domain/language';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  languages:Array<ConlluLanguageModel> =[];
  errorMsg:string="";
  showPinner:boolean;
  toggleMenu:boolean;
  showLanguageDeleteDialog:boolean;
  showCreateLanguageDialog:boolean;

  isForUpdate:boolean;
  currentLanguage:ConlluLanguageModel;
  selectedLanguage:ConlluLanguageModel;
  isTraining:boolean;
  get selectLanguages(){
    return this.languages.filter(item=>item.languageName!=this.currentLanguage.languageName).map(x=>x.languageName);
  }
   
  constructor(public langaugeService:LanguageManagementService) {}
  
  ngOnInit(): void {
   
    this.toggleMenu=false;
    this.showLanguageDeleteDialog=false;
    this.showCreateLanguageDialog=false;
    this.showPinner=false;
    this.errorMsg="";
    this._getLangues();
   
  }

 
  updateLanguage(lang:ConlluLanguageModel){
      if(lang.guid){
        this.errorMsg="";

        this.currentLanguage=lang;
        this.isForUpdate=true;
        this.showCreateLanguageDialog=true;
      }
    }

 


 addLanguage(){
  this.errorMsg="";
  this.currentLanguage=new ConlluLanguageModel(null);
  this.showCreateLanguageDialog=true;
  this.isForUpdate=false;
     
  }

  cancelCreateLanguage(){
    this.errorMsg="";
    this.showCreateLanguageDialog=false;
    this.showPinner=false;
    this.isForUpdate=false;
  }

  confirmCreateLanguage(){
    this.errorMsg="";
    let language=this.currentLanguage.getLanguage();
    try{
      if(this.isForUpdate){
            this.langaugeService.update(language).then((lang)=>{
              for(let lng of this.languages){
                if(lng.guid==lang.guid){
                  lng=this.currentLanguage;
                }
              }
              this.currentLanguage=null;
              this.showPinner=false;
              this.showCreateLanguageDialog=false;
          }).catch((er)=>{
            this.errorMsg=er;
          })
      }else{
        this.langaugeService.create(language).then((lang)=>{
            this.languages.push(new ConlluLanguageModel(lang));
            this.currentLanguage=null;
            this.showPinner=false;
            this.showCreateLanguageDialog=false;
        }).catch((er)=>{
          this.errorMsg=er;
        }) 
        
      }
    }catch(er){ this.errorMsg=er;}
  }



  deleteLanguage(lang:ConlluLanguageModel){
    if(lang.guid){
      this.showLanguageDeleteDialog=true;
      this.currentLanguage=lang;
    }
  }

  confirmDeleteLanguage(){
    this.showLanguageDeleteDialog=false;
    try{
      let language=this.currentLanguage.getLanguage();
      this.langaugeService.delete(language).then(()=>{
          let idx=this.languages.findIndex(x=>x.guid==this.currentLanguage.guid);
          if(idx)
            this.languages.splice(idx,1);
        this.currentLanguage=null;
        this.showPinner=false;
        this.showCreateLanguageDialog=false;
      })
    }catch(er){
      this.errorMsg=er
    } 

  }
 cancelDeleteLanguage(){
    this.showLanguageDeleteDialog=false;
    this.currentLanguage=undefined;
  }
 

  _getLangues(){
    setTimeout(() => {
      this.langaugeService.get().then((langs)=>{
          this.languages=(langs||[]).map(item=>new ConlluLanguageModel(item));
          this.currentLanguage=null;
          this.showPinner=false;
          this.showCreateLanguageDialog=false;
         this.isTraining=this.langaugeService.isTraining()

      }).catch((er)=>{
        this.errorMsg=er;
      }).finally(()=>this.updateTrainedLanguages());
    }, 20);
  }
   
  updateTrainedLanguages(){

    for (let lng of this.languages){
      let lang=lng.getLanguage();
      if(!lang.udpFile&&this.langaugeService.hasUDpipeeFile(lang)){
        lang.udpFile="model";
        setTimeout(() => {
          this.langaugeService.update(lang).then(()=>{
              this.isTraining=this.langaugeService.isTraining()
          });
        }, 20);
      }
    }
  }


 
}
