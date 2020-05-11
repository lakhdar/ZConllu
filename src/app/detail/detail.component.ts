import { Component, OnInit } from '@angular/core';
import { ConlluDataService } from '../services/conllu-data-service';
import { AppSettingsService } from '../services/app-settings-service';

import { ActivatedRoute }     from '@angular/router';
import { ConlluDetailModel,ConlluSentence } from '../model/conllu-detail-model';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  constructor(public service :ConlluDataService,public settings:AppSettingsService ,public route:ActivatedRoute) {
  }

  file:ConlluDetailModel;
  pageSize:number=this.settings.pageSize;
  currentPage:number=1;
  langname:string;
  showSentenceDeleteDialog:boolean;
  showEditSenteceDialog:boolean;
  currentSentence:ConlluSentence;
  oldSentence:ConlluSentence;
  showSpinner:boolean;
  errorMsg:string="";
  bForAdd:boolean;

  get pages():Array<any>{
    return this.getPages()||[];
  }
  get totalsentences():number{
    return this.file.totalsentences;
  }
  set totalsentences(value:number){
    this.file.totalsentences=value;
  }
  get filename(){
    return this.file?.fileName;
  }
  get lastPage() {
    return this.pages[this.pages.length-1]
  }

  get current() {
    return (this.currentPage-1)*this.pageSize+1
  }
  get last() {
    let ret=(this.currentPage)*this.pageSize ;
    return ret>this.totalsentences?this.totalsentences:ret;
  }
 
  

  ngOnInit(): void { 
    this.showSentenceDeleteDialog=false;
    this.showEditSenteceDialog=false;
    this.errorMsg="";
    this._getrouteParams();
    if(this.file.fileName){
      this.service.getLanguage(this.langname).subscribe(lang=>{
          this.totalsentences=(lang.conlluFiles||[]).filter(x=>x.fileName==this.filename)[0].totalsents;
          this.service.getPage(this.langname,this.file.fileName,this.currentPage).subscribe(args=>{
                this.file.sentences=(args||[]).sort((a,b)=>this.service.sortSents(a,b));
                for(let sen of this.file.sentences){
                  sen.lines=(sen.lines||[]).sort((a,b) => (a.index > b.index) ? 1 : ((b.index > a.index) ? -1 : 0));
                }
            })
      })
      
    }
  }

  gotoPage(page:number){
    this.currentPage=page;
    this.service.getLanguage(this.langname).subscribe(lang=>{
      this.totalsentences=(lang.conlluFiles||[]).filter(x=>x.fileName==this.filename)[0].totalsents;
      this.service.getPage(this.langname,this.file.fileName,this.currentPage).subscribe(args=>{
        this.file.sentences=(args||[]).sort((a,b)=>this.service.sortSents(a,b));
        for(let sen of this.file.sentences){
          sen.lines=(sen.lines||[]).sort((a,b) => (a.index > b.index) ? 1 : ((b.index > a.index) ? -1 : 0));
        }
      });
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
        this.service.deleteSentece(this.langname,this.filename,this.currentSentence.sentId,this.currentPage).subscribe(args=>{
          this._updateSentences(args);
          this.currentSentence=undefined;
          this.showSentenceDeleteDialog=false;
          this.showSpinner=false;
          this.service.getLanguage(this.langname).subscribe(lang=>{
            this.totalsentences=(lang.conlluFiles||[]).filter(x=>x.fileName==this.filename)[0].totalsents;
          })
        })
      }catch(er){
        this.errorMsg=er;
        this.showSpinner=false;
        this.currentSentence=undefined;
        this.showSentenceDeleteDialog=false;
      }
  },25)
  }


  addSentence(){
    this.currentSentence=new ConlluSentence([]);
    let sentId=this.file.sentences[0]?.sentId.replace(/\d*$/,"");
    let shft=+this.totalsentences+1;
    this.currentSentence.sentId=(sentId+shft)||"0";
    this.showEditSenteceDialog=true;
    this.bForAdd=true;
  }

  editSentece(sent:ConlluSentence){
    if(!sent.id)sent.id=(new Date().getTime()+"_"+(Math.random()*6|0));
    this.currentSentence=sent;
    this.oldSentence=Object.assign({},sent);
    this.showEditSenteceDialog=true;
    this.bForAdd=false;
  }
  cancelEditSentece(){
    if(this.oldSentence){
      for( let sen of this.file.sentences){
        if(sen.id==this.oldSentence.id&&sen.id){
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
    this.showSpinner=this.bForAdd;
    try{

      if(this.bForAdd){
        setTimeout(() => {
          this.service.addSentence(this.currentSentence,this.langname,this.file.fileName,this.currentPage).subscribe(args=>{
            this._updateSentences(args);
              this.currentSentence=undefined;
              this.showEditSenteceDialog=false;
              this.showSpinner=false;
              this.service.getLanguage(this.langname).subscribe(lang=>{
                 this.totalsentences=(lang.conlluFiles||[]).filter(x=>x.fileName==this.filename)[0].totalsents;
              })
          })
        }, 20);
    }else{
      this.service.updateSentence(this.currentSentence,this.langname,this.file.fileName,this.currentPage).subscribe(arg=>{
        let findIndex=this.file.sentences.findIndex(x=>x.sentId==arg.sentId);
        if(findIndex>=0){
          this.file.sentences[findIndex]=arg;
          this.file.sentences[findIndex].isExpnaded=true;
        }
        this.currentSentence=undefined;
        this.showEditSenteceDialog=false;
      })
    }
    }catch(er){
      console.error(er);
      this.errorMsg=er;
      this.showSpinner=false;
    }
  }


   _updateSentences(args:ConlluSentence[]){
    for(let i=0;i<this.file.sentences.length;i++){
      let st=this.file.sentences[i].sentId;
      if(args.findIndex(x=>x.sentId==st)<0){
        this.file.sentences.splice(i,1);
      }
    }
    for(let i=0;i<args.length;i++){
      let sen=args[i];
      if(this.file.sentences.findIndex(x=>x.sentId==sen.sentId)<0){
        sen.isExpnaded=true;
        this.file.sentences.splice(i,0,sen);
      }
    }
    this.file.sentences=(this.file.sentences||[]).sort((a,b)=>this.service.sortSents(a,b));
   }

  _getrouteParams(){
    let fileName = this.route.snapshot.params['filename'];
    this.currentPage = this.route.snapshot.params['page']||1;
    this.langname = this.route.snapshot.params['langname'];
    this.file=new ConlluDetailModel(fileName);
  }
  getPages(){
    let pg=Math.ceil(this.totalsentences/this.pageSize);
    let keys=[...Array(pg).keys()].map(x=>x+1);
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
}
