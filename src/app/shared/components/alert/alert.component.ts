import { Component, OnInit ,Input} from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  constructor() {}
  @Input() message:string;
  ngOnInit(): void {
    
  }

  get hasMessage(){
    return !!this.message;
  }

  close(){
    this.message="";
  }

}
