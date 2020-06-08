import { Component,Input ,OnInit,Output ,EventEmitter} from '@angular/core';

import{ConlluWordLineModel,ConlluSentenceDetails} from "../../../model/conllu-model"
import { AppSettingsService } from '../../../services/app-settings-service';
import { WordLineManagementService } from '../../../../management/word-line-management-service';



@Component({
  selector: 'app-sent-panel',
  templateUrl: './sent-panel.component.html',
  styleUrls: ['./sent-panel.component.scss']
})
export class SentPanelComponent implements OnInit {
  
  @Output() deleteSent = new EventEmitter()
  @Output() editSent = new EventEmitter()
  @Input() langName:string;
  @Input() fileName:string;
  @Input() currentPage:number;
  @Input()sent:ConlluSentenceDetails;

  currentLine:ConlluWordLineModel;
  oldLine:ConlluWordLineModel;

  toggle:boolean=false;
  showLineDeleteDialog:boolean;
  showEditLineDialog:boolean;
  bForAdd:boolean;
  UPOS:any[];
  DEPREL:any[];
  _FEATS:any[];
  allFEATS:any[];
  errorMsg:string="";

  constructor(public settings :AppSettingsService,public service :WordLineManagementService) {
    this.UPOS=this.settings.UPOS;
    this.DEPREL=this.settings.DEPREL;
    this.allFEATS=this.settings.FEATS.sort((left,right)=>{return left.name > right.name ? 1 : (right.name > left.name) ? -1 : 0 ;});

  }

  ngOnInit(): void {
  }


  togglePanel(){
    this.sent.isExpanded=!this.sent.isExpanded;
    if(this.sent.isExpanded){
      this.service.get(this.sent.guid,this.langName,this.fileName,0,1000).then((lines)=>{
        this.sent.lines=(lines||[]).map(x=>new ConlluWordLineModel(x) );
      }).catch(er=>this._showError(er,"togglePanel"));
    }
  }


addOrRemoveFeat(feat){
  feat.checked=!feat.checked;
  let idx= this._FEATS.findIndex(x=>x.name==feat.name);
  if(idx>=0 && !feat.checked){
    this._FEATS.splice(idx,1);
    this.updateFeats();
  }else if(feat.checked){
    this._FEATS.push(feat);
  }
  
  this.currentLine.isFEATExpanded=false;
}
  updateFeats(){
    let fts=[];
    for(let feat of this._FEATS){
        fts.push(feat.name+"="+feat.value);
    }
    this.currentLine.FEATS=fts.join('|');
  }
  getfeats(){
    let arr=[];
    let txt=(this.currentLine.FEATS+"").replace("_","");
    if(txt) {
      let split=txt.split("|");
      for(let ft of split){
          let spt=ft.split("=");
          arr.push({
              name:spt.shift(),
              value:spt.pop(),
              items:[]
          })
        
      }
      for(let feat of this.allFEATS){
        feat.checked=false;
        let idx=arr.findIndex(x=>x.name==feat.name);
        if(idx>=0){
          feat.checked=true;
          arr[idx].items=feat.items;
        }
      }
    }
    return arr;
  }
  
  toggleFeatsPanel(){
    this.currentLine.isFEATExpanded=!this.currentLine.isFEATExpanded;
    if(this.currentLine.isFEATExpanded){
      console.log("toggleFeatsPanel isFEATExpanded")
      this.getfeats();
    }
  }

  addLine(){
    this.errorMsg="";
    this.currentLine=new ConlluWordLineModel(null); 
    this.currentLine.sentenceId=this.sent.guid;
    this.showEditLineDialog=true;
    this.bForAdd=true;
    this._FEATS=[];
    if(!this.sent.isExpanded)
       this.togglePanel();
  }

   



  editLine(line:ConlluWordLineModel){
    this._FEATS=[];
    this.errorMsg="";
    this.currentLine=line ;
    this.currentLine.sentenceId=this.sent.guid;
    this.oldLine= Object.assign({}, line);
    this._FEATS=this. getfeats();
    this.sent.isExpanded=true;
    this.showEditLineDialog=true;
    this.bForAdd=false;
  }

  cancelEditLine(){
    this.showEditLineDialog=false;
    this.sent.isExpanded=true;
    if(this.oldLine){
      for( let lne of this.sent.lines){
        if(lne.guid==this.oldLine.guid&&lne.guid){
          for(var p in lne){
            if(lne[p]!=this.oldLine[p]){
              lne[p]=this.oldLine[p];
            }
          }
        }
      }
    }
    this.currentLine=null;
    this.oldLine=null;
    this.errorMsg="";
  }

 
  confirmEditLine(){
    this.errorMsg="";
    this.sent.isExpanded=false;
    try{
      if(this.bForAdd){
        
        this.currentLine.index=this.getRowIndex()
        let line=this.currentLine.getLine();
        this.service.create(line,this.langName,this.fileName).then(dbline=>{
          this.showEditLineDialog=false;
          this.currentLine=undefined;
          this.oldLine=null;
          setTimeout(() => {
            this.togglePanel();
          }, 10);
        })
      }else{
        let line=this.currentLine.getLine();
        let ulines=this.updateLinesIndexes().map(x=>x.getLine());
        ulines.push(line)
        this.service.updateRange(ulines,this.langName,this.fileName).then(args=>{
          this.showEditLineDialog=false;
          this.currentLine=undefined;
          this.oldLine=null;
          setTimeout(() => {
            this.togglePanel();
          }, 10);
         })
      }
    }catch(er){
      console.error(er);
      this.errorMsg=er;
    }
  }


  

  deleteLine(line:ConlluWordLineModel){
    this.errorMsg="";
    this.currentLine=line;
    this.sent.isExpanded=true;
    this.showLineDeleteDialog=true;
  }

  cancelLineDelete(){
    this.showLineDeleteDialog=false;
    this.currentLine=undefined;
    this.sent.isExpanded=true;
  }
  confirmLineDelete(){
    this.errorMsg="";
      try{
        let line=this.currentLine.getLine();
        this.service.delete(line,this.langName,this.fileName).then(args=>{
          let idx=this.sent.lines.findIndex(x=>x.guid==line.guid);
          if(idx>=0)
            this.sent.lines.splice(idx,1);
          this.sent.isExpanded=true;
          this.showLineDeleteDialog=false;
        })
      }catch(er){
        console.error(er);
        this.errorMsg=er;
      } 
  }

  OnSentDeleting(){
    this.deleteSent.emit();
  }

  OnEditSentence(){
    this.editSent.emit();
  }
  getRowIndex():string{
    let ret=this.currentLine.index;
    let rowIndex=+(this.currentLine.index+"").split(/-|\./).shift();
    if(!rowIndex)
        ret=(this.sent.lines.length+1)+"";
    return ret;

  }
  updateLinesIndexes(){
    let idx=+(this.currentLine.index+"").split(/-|\./).shift(); 
    let updateLines=[];
    for( let i=idx-1 ; i<this.sent.lines.length ;i++){
      let nextLine=this.sent.lines[i+1];
      if(!nextLine) break;
      let idex=+(this.sent.lines[i].index+"").split(/-|\./).shift();
      let splt=(nextLine.index+"").split(/-|\./);
      let nextIndex=+splt.shift();
      if(nextIndex!=idex+1){

        let newdex=(idex+1)+"";
        let pp=+splt.pop()+1;
        if(/-/.test(nextLine.index)){
          newdex+="-"+pp;
        }
        else if(/\./.test(nextLine.index)){
          newdex+="."+pp;
        }
      
        this.sent.lines[i+1].index=newdex;
      
        updateLines.push(this.sent.lines[i+1]);
      }
    }
    return updateLines;
  }


  _showError(er,action?:string){
    console.error(er)
    this.errorMsg=er;
    //this.showSpinner=false;
   }
}
