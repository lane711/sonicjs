import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "projects/sonic-core/src/lib/components/home/home.component";
import { ContentTypesComponent } from "projects/sonic-core/src/lib/components/content-types/content-types.component";
import { ContentTypeAddComponent } from "projects/sonic-core/src/lib/components/content-types/content-type-add/content-type-add.component";
import { ContentTypeEditComponent } from "projects/sonic-core/src/lib/components/content-types/content-type-edit/content-type-edit.component";
import { ContentTypeEditFieldComponent } from "projects/sonic-core/src/lib/components/content-types/content-type-edit-field/content-type-edit-field.component";
import { ContentComponent } from "projects/sonic-core/src/lib/components/content/content.component";
import { ContentEditComponent } from "projects/sonic-core/src/lib/components/content/content-edit/content-edit.component";
import { ContentAddComponent } from "projects/sonic-core/src/lib/components/content/content-add/content-add.component";

import { FieldTypesComponent } from "projects/sonic-core/src/lib/components/field-types/field-types.component";
import { PagesComponent } from "projects/sonic-core/src/lib/components/pages/pages.component";
import { SandboxComponent } from "projects/sonic-core/src/lib/components/sandbox/sandbox.component";

const routes: Routes = [
    { path: "admin", component: HomeComponent},
    { path: "admin/field-types", component: FieldTypesComponent },
    { path: "admin/content-types", component: ContentTypesComponent },
    { path: "admin/content-types/add", component: ContentTypeAddComponent },
    { path: "admin/content-types/:id", component: ContentTypeEditComponent },
    // { path: "admin/content-types/:id/fieldId/:fieldId", component: ContentTypeEditComponent },
    { path: "admin/content-types/:id/fieldId/:fieldId", component: ContentTypeEditFieldComponent },
    { path: "admin/content", component: ContentComponent },
    { path: "admin/content/add", component: ContentAddComponent },
    { path: "admin/content/:id", component: ContentEditComponent },
    { path: "admin/sandbox", component: SandboxComponent },
    { path: "**", component: PagesComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
export const routingComopnents = [HomeComponent,
  ContentTypesComponent,
  ContentTypeAddComponent,
  ContentTypeEditComponent,
  ContentComponent]
