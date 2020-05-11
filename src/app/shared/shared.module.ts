import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent,SideBarComponent ,FooterComponent,
  NavComponent,LanguagePanelComponent,SentPanelComponent,
  ModalPopupComponent,SpinnerComponent,AlertComponent
} from './components/';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [PageNotFoundComponent,SideBarComponent,FooterComponent,NavComponent,LanguagePanelComponent
    ,SentPanelComponent,ModalPopupComponent,SpinnerComponent,AlertComponent],
  imports: [CommonModule, TranslateModule, FormsModule,RouterModule ],
  exports: [TranslateModule,  FormsModule,SideBarComponent ,FooterComponent,NavComponent,
    LanguagePanelComponent,SentPanelComponent,ModalPopupComponent,SpinnerComponent,AlertComponent]
})
export class SharedModule {}
