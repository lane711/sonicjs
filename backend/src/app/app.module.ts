import { BrowserModule } from "@angular/platform-browser";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { ContentTypesComponent } from "./components/content-types/content-types.component";
import { AppRoutingModule } from "./app-routing/app-routing.module";
import { ContentComponent } from "./components/content/content.component";
import { AdminSideMenuComponent } from "./components/admin-side-menu/admin-side-menu.component";
import { HomeComponent } from "./components/home/home.component";
import { FieldTypesComponent } from "./components/field-types/field-types.component";
import { SafePipe } from "./pipes/safe.pipe";
import { ContentTypeAddComponent } from "./components/content-types/content-type-add/content-type-add.component";
import { ContentTypeEditComponent } from "./components/content-types/content-type-edit/content-type-edit.component";
import { ContentTypeEditFieldsComponent } from "./components/content-types/content-type-edit-fields/content-type-edit-fields.component";
import { ContentTypeEditViewsComponent } from "./components/content-types/content-type-edit-views/content-type-edit-views.component";
import { ContentTypeEditPermissionsComponent } from "./components/content-types/content-type-edit-permissions/content-type-edit-permissions.component";
import { ContentTypeEditSettingsComponent } from "./components/content-types/content-type-edit-settings/content-type-edit-settings.component";
import { ContentTypeEditCreateInstanceComponent } from "./components/content-types/content-type-edit-create-instance/content-type-edit-create-instance.component";
import { FormsComponent } from "./components/forms/forms.component";
import { QuestionsComponent } from "./components/forms/questions/questions.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PagesComponent } from './components/pages/pages.component';
import { ContentTypeEditFieldComponent } from './components/content-types/content-type-edit-field/content-type-edit-field.component';
import { AsideMenuComponent } from './components/aside-menu/aside-menu.component';
import { ContentEditComponent } from './components/content/content-edit/content-edit.component';
import { AlertMessageComponent } from './components/alert-message/alert-message.component';
import { LayoutComponent } from './components/forms/layout/layout.component';
import { SandboxComponent } from './components/sandbox/sandbox.component';
import { ContentAddComponent } from './components/content/content-add/content-add.component';
import { PageBuilderComponent } from './components/page-builder/page-builder.component';
import { PageBuilderEditorComponent } from './components/page-builder-editor/page-builder-editor.component';
import { EditorModule } from '@tinymce/tinymce-angular';

@NgModule({
  declarations: [
    AppComponent,
    ContentTypesComponent,
    ContentComponent,
    AdminSideMenuComponent,
    HomeComponent,
    FieldTypesComponent,
    SafePipe,
    ContentTypeEditComponent,
    ContentTypeEditFieldsComponent,
    ContentTypeEditViewsComponent,
    ContentTypeEditPermissionsComponent,
    ContentTypeEditSettingsComponent,
    ContentTypeEditCreateInstanceComponent,
    ContentTypeAddComponent,
    FormsComponent,
    QuestionsComponent,
    PagesComponent,
    ContentTypeEditFieldComponent,
    AsideMenuComponent,
    ContentEditComponent,
    AlertMessageComponent,
    LayoutComponent,
    SandboxComponent,
    ContentAddComponent,
    PageBuilderComponent,
    PageBuilderEditorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule,
    EditorModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
  // entryComponents: [MenuComponent]
})
export class AppModule {}
