import { Injectable } from '@angular/core';
import { ConlluBlock,ConlluSentence,ConlluLine} from '../model/conllu-detail-model';
import { TrainModel } from '../model/train-model';

@Injectable({
  providedIn: 'root'
})
export class UDPipeService {

  constructor() {}

 parseSentence(sent:ConlluSentence):ConlluSentence{
 let splt=sent.text.split(/\b/gi);
 let i=1;
 for(let p of splt){
   p=p.replace(/\s/gi,"");
   if(p){
     let line=new ConlluLine("");
     line.index=i;
     line.word=p;
     line.lemma=p;
     sent.lines.push(line);
   }
 }
  return sent;
 }

 trainUDPipeAutoTagger(model:TrainModel, modelPath:string){
  throw new Error("fdsfxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxsdfsdf");
  
 }

}
