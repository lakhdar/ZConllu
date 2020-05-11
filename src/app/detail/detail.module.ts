import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DetailRoutingModule } from './detail-routing.module';

import { DetailComponent } from './detail.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [DetailComponent],
  imports: [CommonModule, DetailRoutingModule,SharedModule]
})
export class DetailModule {}
