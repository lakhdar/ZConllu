import { Component, OnInit } from '@angular/core';
import { ConlluDataService } from '../services/conllu-data-service';
import { ConlluModel } from '../model/conllu-model';
import { ConlluLanguageModel } from '../model/conllu-language-model';
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
  currentLanguage:ConlluLanguageModel;
  selectedLanguage:ConlluLanguageModel;

  get selectLanguages(){
    return this.languages.filter(item=>item.languageName!=this.currentLanguage.languageName).map(x=>x.languageName);
  }
  
  constructor(private service: ConlluDataService) {}
  
  ngOnInit(): void {
    this.toggleMenu=false;
    this.showLanguageDeleteDialog=false;
    this.showPinner=false;
    this.errorMsg="";
    this.service.getLanguages().subscribe(args=>{
      this.languages=(args||[]).sort((a,b) => (a.languageName > b.languageName) ? 1 : ((b.languageName > a.languageName) ? -1 : 0));
    })
   
  }

 
 
 addLanguage(){
   let lng=this.languages.length;
    let lang=new ConlluLanguageModel("X"+lng);
    lang.isPrestine=true;
    try{
        this.showPinner=true;
        this.service.createLanguage(lang).subscribe(args=>{
          this._updatelanguages(args);
          this.showPinner=false;
        });
    }catch(er){
      this.errorMsg=er
    } 
     
  }

  deleteLanguage(lang:ConlluLanguageModel){
    this.showLanguageDeleteDialog=true;
    this.currentLanguage=lang;
  }

  confirmDeleteLanguage(){
    this.showLanguageDeleteDialog=false;
    try{
      this.service.deleteLanguage(this.currentLanguage).subscribe(args=>{
        this.currentLanguage=undefined;
        this._updatelanguages(args);
      })
    }catch(er){
      this.errorMsg=er
    } 

  }
 cancelDeleteLanguage(){
    this.showLanguageDeleteDialog=false;
    this.currentLanguage=undefined;
  }
 
  renameLanguage(event,lang){
  }
 
 
 _updatelanguages(results:ConlluLanguageModel[]){
    let res=(results||[]);
    for(let ob of res){
      if(this.languages.findIndex(x => x.languageName === ob.languageName)<0){
        this.languages.push(ob);
      }
    }

    for(let i=0;i<this.languages.length;i++){
      let lng=this.languages[i].languageName
      if(res.findIndex(x => x.languageName === lng)<0){
          this.languages.splice(i,1);
      }
    }
 }
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
  // openCopyDialog(languageName,fileName){
  //   this.errorMsg="";
  //   this.showMoveDialog=true;
  //   this.selectedFile=fileName;
  //   this.currentLanguage=languageName
  // }

  // movefile(destlang,fileName){
  //   this.errorMsg="";
  //    if(destlang&&fileName){
  //      try{
  //     this.localsetrvice.moveFile(this.currentLanguage,destlang,fileName);
  //     this.localsetrvice.updateConllus().subscribe(arg =>{
  //       this.languages = arg||[];
  //     }) 
  //     this.showMoveDialog=false;
  //   }catch(er){
  //     console.log(er);
  //     this.errorMsg=er
  //   }
  //   }else{
  //     this.errorMsg="Destination language is required"
  //   }
  // }

  // addLanguage(){
  //   let lang=new ConlluLanguageModel("XX");
  //   this.localsetrvice.addLanguage(lang);
  //   this.localsetrvice.updateConllus().subscribe(arg =>{
  //     this.languages = (arg||[]).map(item=>{item.isPrestine=/xx/gi.test(item.languageName);return item});
  //   }) 
  // }

  // delete(languageName:string,filename?:string){
   
  //   if(languageName){
  //     languageName=languageName.toUpperCase();
  //       this.localsetrvice.delete(languageName,filename,()=>{
  //           this.localsetrvice.updateConllus().subscribe(arg =>{
  //             this.languages = arg||[];
  //             this.localsetrvice.updateNewFiles().then(items=>{
  //               this.languages = items||[];
  //             })
  //           }) 
  //       });
  //   }
  // }

  // rename(event,lang){
  //   if(event!=lang.languageName){
  //     let lngName=lang.languageName.toUpperCase();
  //     this.localsetrvice.renameDirs(event,lngName,()=>{
  //         this.localsetrvice.updateConllus().subscribe(arg =>{
  //           this.languages = arg||[];
  //           this.localsetrvice.updateNewFiles().then(items=>{
  //             this.languages = items||[];
  //           })
  //         }) 
  //     });
  // }
  // }




  // importeFile(langName){
  //   if(langName){
  //     langName=langName.toUpperCase();
  //     this.localsetrvice.openfileDialog(langName,()=>{
  //       this.localsetrvice.updateConllus().subscribe(arg =>{
  //         this.languages = arg||[];
  //         this.localsetrvice.updateNewFiles().then(items=>{
  //           this.languages = items||[];
  //         })
  //       }) 
  //     });
  //   }
  // }
  
}
