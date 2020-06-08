import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HomeModule } from './home/home.module';
import { DetailModule } from './detail/detail.module';
import { ElectronHelperService } from './services/electron-helper-service';

import { ElectronService } from 'ngx-electron';
import { SharedModule } from './shared/shared.module';
import { LanguageManagementService } from '../management/language-management-service';
import { DocumentManagementService } from '../management/document-management-service';
import { SentnceManagementService } from '../management/sentence-management-service';
import { WordLineManagementService } from '../management/word-line-management-service';


import { LanguageRepository } from "../data/repositories/language-repoistory";
import { ConlluDocumentRepository } from "../data/repositories/document-repository";
import { SentenceRepository } from "../data/repositories/sentence-repoistory";
import { WordLineRepository } from "../data/repositories/word-line-repoistory";


import { SqlLiteUoW } from "../data/uow/sql-lite-uow";
import { FileSystemeUoW } from "../data/uow/fs-uow";
import { DataSettings } from "../data/setting";

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule, 
    SharedModule,
    HomeModule,
    
    DetailModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [ElectronHelperService,ElectronService,
              LanguageManagementService,
              LanguageRepository,
              SqlLiteUoW,
               FileSystemeUoW,
                DataSettings,
                DocumentManagementService,ConlluDocumentRepository,
                SentnceManagementService,SentenceRepository,
                WordLineManagementService,WordLineRepository
            ],
  bootstrap: [AppComponent]
})
export class AppModule { }
