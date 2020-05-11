import { Component } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { ElectronHelperService } from './services/electron-helper-service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'zConllU';

  constructor(
    public electronService: ElectronService,
    public electronHelper:ElectronHelperService,
    private translate: TranslateService
  ) {
    translate.setDefaultLang('en');
    console.log('environment', environment);
    if (electronService.isElectronApp) {
      console.log('Mode electron');
    } else {
      console.log('Mode web');
    }
  }
}
