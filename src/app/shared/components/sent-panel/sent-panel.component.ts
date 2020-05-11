import { Component,Input ,OnInit,Output ,EventEmitter} from '@angular/core';
import{ConlluSentence,ConlluLine} from "../../../model/conllu-detail-model"
import { ConlluDataService } from '../../../services/conllu-data-service';
import { AppSettingsService } from '../../../services/app-settings-service';

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
  @Input()sent:ConlluSentence;
  currentLine:ConlluLine;
  oldLine:ConlluLine;
  toggle:boolean=false;
  showLineDeleteDialog:boolean;
  showEditLineDialog:boolean;
  bForAdd:boolean;
  UPOS:any[];
  DEPREL:any[];
  _FEATS:any[];
  allFEATS:any[];
  errorMsg:string="";

  constructor(private service: ConlluDataService,public settings :AppSettingsService) {
    this.UPOS=this.settings.UPOS;
    this.DEPREL=this.settings.DEPREL;
    this.allFEATS=this.settings.FEATS;

  }

  ngOnInit(): void {
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
  
   

  addLine(){
    this.errorMsg="";
    this.currentLine=new ConlluLine(""); 
    this.sent.isExpnaded=true;
    this.showEditLineDialog=true;
    this.bForAdd=true;
  }

  cancelAddLine(){
    this.showEditLineDialog=false;
    this.currentLine=undefined;
    this.sent.isExpnaded=true;
  }



  editLine(line:ConlluLine){
    if(!line.id)
      line.id=(new Date().getTime()+"_"+(Math.random()*6|0));
    this.errorMsg="";
    this.currentLine=line ;
    this.oldLine= Object.assign({}, line);
    this._FEATS=this. getfeats();
    this.sent.isExpnaded=true;
    this.showEditLineDialog=true;
    this.bForAdd=false;
  }

  cancelEditLine(){
    this.showEditLineDialog=false;
    this.sent.isExpnaded=true;
    for( let lne of this.sent.lines){
      if(lne.id==this.oldLine.id&&lne.id){
        for(var p in lne){
          if(lne[p]!=this.oldLine[p]){
            lne[p]=this.oldLine[p];
          }
        }
      }
    }
    this.currentLine=null;
    this.oldLine=null;
  }
  confirmEditLine(){
    this.errorMsg="";
    try{
      if(this.bForAdd){
        if(this.currentLine.index>this.sent.lines.length){
          this.currentLine.index=this.sent.lines.length+1;
        }
        if(this.currentLine.index<1){
          this.currentLine.index=1;
        }
        this.service.addLine(this.currentLine,this.sent,this.langName,this.fileName,this.currentPage).subscribe(sentence=>{
          let idx=+this.currentLine.index-1;
          this.sent.lines.splice(idx,0,this.currentLine);
          this.sent.isExpnaded=true;
          this.showEditLineDialog=false;
          this.currentLine=undefined;
          this.oldLine=null;
        })
      }else{
        console.log(this.currentLine)
        this.service.updateLine(this.currentLine,this.sent,this.langName,this.fileName,this.currentPage).subscribe(args=>{
          this.sent.isExpnaded=true;
          this.showEditLineDialog=false;
          this.currentLine=undefined;
          this.oldLine=null;
        })
      }
    }catch(er){
      console.error(er);
      this.errorMsg=er;
    }
  }


  

  deleteLine(line:ConlluLine){
    this.errorMsg="";
    this.currentLine=line;
    this.sent.isExpnaded=true;
    this.showLineDeleteDialog=true;
  }

  cancelLineDelete(){
    this.showLineDeleteDialog=false;
    this.currentLine=undefined;
    this.sent.isExpnaded=true;
  }
  confirmLineDelete(){
    this.errorMsg="";
    try{
      this.service.deleteLine(this.sent,this.langName,this.fileName,this.currentLine.index,this.currentPage).subscribe(args=>{
        this.sent.isExpnaded=true;
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
  
}
