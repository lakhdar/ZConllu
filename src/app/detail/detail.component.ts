import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }     from '@angular/router';

import { AppSettingsService } from '../services/app-settings-service';
import { DocumentManagementService } from '../../management/document-management-service';
import { SentnceManagementService } from '../../management/sentence-management-service';
import { LanguageManagementService } from '../../management/language-management-service';
import { ConlluModelDetails ,ConlluSentenceDetails} from '../model/conllu-model';
@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  constructor(
    public documentService:DocumentManagementService,
    public sentencesService:SentnceManagementService,
    public settings:AppSettingsService ,
    public languageService:LanguageManagementService ,
    public route:ActivatedRoute
    ) {

      this.document=new ConlluModelDetails(null);
  }
 document:ConlluModelDetails;
 currentSentence:ConlluSentenceDetails;
 oldSentence:ConlluSentenceDetails;

  translationLanguages:string[];
  pageSize:number=this.settings.pageSize;
  currentPage:number=1;
  langname:string;
  showSentenceDeleteDialog:boolean;
  showEditSenteceDialog:boolean;
  showSpinner:boolean;
  showAddTranslationDropDown:boolean;
  errorMsg:string="";
  bForAdd:boolean;
  pages:Array<any>=[]
  get totalsentences():number{
    return this.document.totalsentences;
  }
  set totalsentences(value:number){
    this.document.totalsentences=value;
  }
  get lastPage() {
    return this.pages[this.pages.length-1]
  }

  get current() {
    return this.document.totalsentences?(this.currentPage-1)*this.pageSize+1:0;
  }
  get last() {
    let ret=(this.currentPage)*this.pageSize ;
    return !this.totalsentences?0:ret>this.totalsentences?this.totalsentences:ret;
  }
 
  

  ngOnInit(): void { 
    this.showSentenceDeleteDialog=false;
    this.showEditSenteceDialog=false;
    this.errorMsg="";
    let guid=this._getrouteParams();
      if(guid){
        this.documentService.getById(guid,this.langname).then((doc)=>{
          this.document=new ConlluModelDetails(doc);
          this.pages=this.getPages();
        })
      }
  }

  gotoPage(page:number){
    this.currentPage=page;
    let skip=(this.currentPage-1)*this.pageSize;
    this.sentencesService.get(this.langname,this.document.fileName,skip,this.pageSize).then((sents)=>{
      this.document.sentences= (sents||[]).map(item=>new ConlluSentenceDetails(item));
      this.document.totalsentences=((sents||[])[0]||{}).total;
    })
  }

  deletesent(sent){
    this.currentSentence=sent;
    this.showSentenceDeleteDialog=true;
  }

  cancelDeleteSentence(){
    this.currentSentence=undefined;
    this.showSentenceDeleteDialog=false;
  }

  confirmDeleteSentence(){
    this.errorMsg="";
    this.showSpinner=true;
    setTimeout(() => {
      try{
        let sent=this.currentSentence.getSentence();
        this.sentencesService.delete(sent,this.langname,this.document.fileName).then(()=>{
          setTimeout(() => {
                  let skip=(this.currentPage-1)*this.pageSize;
                  this.sentencesService.get(this.langname,this.document.fileName,skip,this.pageSize).then((sents)=>{
                      this.document.sentences= (sents||[]).map(item=>new ConlluSentenceDetails(item));
                      this.document.totalsentences=((sents||[])[0]||{}).total;
                      this.pages=this.getPages();
                      this.currentSentence=undefined;
                      this.showSentenceDeleteDialog=false;
                  }).catch(er=>this._showError(er)).finally(()=> this.showSpinner=false);
          }, 20);
        }).catch(er=>this._showError(er));
      }catch(er){
        this._showError(er);
      }
  },25)
  }
 

  addSentence(){
    this.currentSentence=new ConlluSentenceDetails(null);
    this.currentSentence.documentId=this.document.guid;
    this.showEditSenteceDialog=true;
    this.bForAdd=true;
    this.getTranslationLanguages();
  }

  editSentece(sent:ConlluSentenceDetails){
    this.currentSentence=sent;
    this.oldSentence=Object.assign({},sent);
    this.showEditSenteceDialog=true;
    this.bForAdd=false;
    this.getTranslationLanguages();
  }

  cancelEditSentece(){
    if(this.oldSentence){
      for( let sen of this.document.sentences){
        if(sen.guid==this.oldSentence.guid&&sen.guid){
          sen.sentId=this.oldSentence.sentId;
          sen.text=this.oldSentence.text;
        }
      }
    }
    this.oldSentence=null;
    this.currentSentence=undefined;
    this.showEditSenteceDialog=false;
  }
  confirmEditSentece(){
    this.errorMsg="";
    this.showSpinner=true;
    try{
      let sent=this.currentSentence.getSentence();
      if(this.bForAdd){
        setTimeout(() => {
            this.sentencesService.create(sent,this.langname,this.document.fileName).then(sent=>{
              this.sentencesService.segmentSentnce(sent.guid, this.langname,this.document.fileName,sent.text)
                setTimeout(() => {
                  let skip=0;
                  this.sentencesService.get(this.langname,this.document.fileName,skip,this.pageSize).then((sents)=>{
                      this.currentPage=1;
                      this.document.sentences= (sents||[]).map(item=>new ConlluSentenceDetails(item));
                      this.document.totalsentences=((sents||[])[0]||{}).total;
                      this.pages=this.getPages();
                      this.currentSentence=undefined;
                      this.showEditSenteceDialog=false;
                  }).catch(er=>this._showError(er)).finally(()=> this.showSpinner=false);
                }, 20);
            }).catch(er=>this._showError(er)).finally(()=> this.showSpinner=false);
        }, 20);
      }else{
        this.sentencesService.update(sent,this.langname,this.document.fileName).then(sent=>{
            let findIndex=this.document.sentences.findIndex(x=>x.guid==this.currentSentence.guid);
            if(findIndex>=0){
              this.currentSentence.isExpanded=true;
              this.document.sentences[findIndex]=this.currentSentence;
            }
            this.currentSentence=undefined;
            this.showEditSenteceDialog=false;
        }).catch(er=>this._showError(er)).finally(()=> this.showSpinner=false);
      }
    }catch(er){
      this._showError(er)
    }
  }

  getTranslationLanguages(){
    if(!this.translationLanguages||!this.translationLanguages.length){
      this.languageService.get().then(lngs=>{
        this.translationLanguages=(lngs||[]).filter(x=>x.name!=this.langname).map(x=>x.name);
      })
    }
  }

  addTranslation(lng:string){
    if(this.currentSentence.translations.findIndex(x=>x.language==lng)<0){
        this.currentSentence.translations.push({language:lng,text:''});
        this.showAddTranslationDropDown=false;
      }
  }
    

  _getrouteParams():number{
    let guid = this.route.snapshot.params['guid'];
    this.currentPage = this.route.snapshot.params['page']||1;
    this.langname = this.route.snapshot.params['langname'];
     return guid;
  }




  getPages(){
    let pg=Math.ceil(this.totalsentences/this.pageSize)||0;
    let keys=pg?[...Array(pg).keys()].map(x=>x+1):[];
    let pgs=[];
    if(pg<5){
      pgs=keys;
    }else{
      let tarr=this.currentPage>1?[(this.currentPage-1)||1,this.currentPage,this.currentPage+1]:[1,2,3];
      if(this.currentPage<4){
        pgs=[...tarr,...[".",".",".",pg]];
      }
      if(this.currentPage>=4&&this.currentPage<pg-2)
      pgs=[...[".",".","."],...tarr,...[".",".","."],pg];
      if(this.currentPage>=pg-2)
      pgs=[...[".",".","."],pg];
    }
    return pgs;
   }

   _showError(er){
    console.error(er);
    this.errorMsg=er;
    this.showSpinner=false;
  }
}
