import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TreeviewModule } from 'ngx-treeview';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BookComponent } from './book/book.component';
import { NotFoundComponent } from './not-found.component';
import { I18n } from './i18n';
import { DisabledOnSelectorDirective } from './disabled-on-selector.directive';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    TreeviewModule.forRoot(),
    AppRoutingModule,
    NgxJsonViewerModule,
  ],
  declarations: [
    NotFoundComponent,
    BookComponent,
    AppComponent,
    DisabledOnSelectorDirective
  ],
  providers: [
    I18n
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
