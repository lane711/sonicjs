import { BrowserModule } from "@angular/platform-browser";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { ContentTypesComponent } from "projects/sonic-core/src/lib/components/content-types/content-types.component";
import { AppRoutingModule } from "./app-routing/app-routing.module";
import { ContentComponent } from "projects/sonic-core/src/lib/components/content/content.component";
import { AdminSideMenuComponent } from "projects/sonic-core/src/lib/components/admin-side-menu/admin-side-menu.component";
import { HomeComponent } from "projects/sonic-core/src/lib/components/home/home.component";
import { FieldTypesComponent } from "projects/sonic-core/src/lib/components/field-types/field-types.component";
import { SafePipe } from "projects/sonic-core/src/lib/pipes/safe.pipe";
import { ContentTypeAddComponent } from "projects/sonic-core/src/lib/components/content-types/content-type-add/content-type-add.component";
import { ContentTypeEditComponent } from "projects/sonic-core/src/lib/components/content-types/content-type-edit/content-type-edit.component";
import { ContentTypeEditFieldsComponent } from "projects/sonic-core/src/lib/components/content-types/content-type-edit-fields/content-type-edit-fields.component";
import { ContentTypeEditViewsComponent } from "projects/sonic-core/src/lib/components/content-types/content-type-edit-views/content-type-edit-views.component";
import { ContentTypeEditPermissionsComponent } from "projects/sonic-core/src/lib/components/content-types/content-type-edit-permissions/content-type-edit-permissions.component";
import { ContentTypeEditSettingsComponent } from "projects/sonic-core/src/lib/components/content-types/content-type-edit-settings/content-type-edit-settings.component";
import { ContentTypeEditCreateInstanceComponent } from "projects/sonic-core/src/lib/components/content-types/content-type-edit-create-instance/content-type-edit-create-instance.component";
import { FormsComponent } from "projects/sonic-core/src/lib/components/forms/forms.component";
import { QuestionsComponent } from "projects/sonic-core/src/lib/components/forms/questions/questions.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PagesComponent } from 'projects/sonic-core/src/lib/components/pages/pages.component';
import { ContentTypeEditFieldComponent } from 'projects/sonic-core/src/lib/components/content-types/content-type-edit-field/content-type-edit-field.component';
import { AsideMenuComponent } from 'projects/sonic-core/src/lib/components/aside-menu/aside-menu.component';
import { ContentEditComponent } from 'projects/sonic-core/src/lib/components/content/content-edit/content-edit.component';
import { AlertMessageComponent } from 'projects/sonic-core/src/lib/components/alert-message/alert-message.component';
import { LayoutComponent } from 'projects/sonic-core/src/lib/components/forms/layout/layout.component';
import { SandboxComponent } from 'projects/sonic-core/src/lib/components/sandbox/sandbox.component';
import { ContentAddComponent } from 'projects/sonic-core/src/lib/components/content/content-add/content-add.component';

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
    ContentAddComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
  // entryComponents: [MenuComponent]
})
export class AppModule {}
