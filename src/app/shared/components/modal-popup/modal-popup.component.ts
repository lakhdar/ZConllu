import { Component, OnInit,Input,Output ,EventEmitter} from '@angular/core';

@Component({
  selector: 'app-modal-popup',
  templateUrl: './modal-popup.component.html',
  styleUrls: ['./modal-popup.component.scss']
})
export class ModalPopupComponent implements OnInit {
  @Input()showpopup:Boolean;

  @Output() close = new EventEmitter();
  @Output() save = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    this.showpopup=false;
  }

  onclose(){
    this.close.emit()
  }

  onsave(){
    this.save.emit()
  }

}
