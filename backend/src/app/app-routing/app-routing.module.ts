import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "../components/home/home.component";
import { ContentTypesComponent } from "../components/content-types/content-types.component";
import { ContentTypeAddComponent } from "../components/content-types/content-type-add/content-type-add.component";
import { ContentTypeEditComponent } from "../components/content-types/content-type-edit/content-type-edit.component";
import { ContentTypeEditFieldComponent } from "../components/content-types/content-type-edit-field/content-type-edit-field.component";
import { ContentComponent } from "../components/content/content.component";
import { FieldTypesComponent } from "../components/field-types/field-types.component";
import { PagesComponent } from "../components/pages/pages.component";

const routes: Routes = [
    { path: "admin", component: HomeComponent},
    { path: "admin/field-types", component: FieldTypesComponent },
    { path: "admin/content-types", component: ContentTypesComponent },
    { path: "admin/content-types/add", component: ContentTypeAddComponent },
    { path: "admin/content-types/:id", component: ContentTypeEditComponent },
    // { path: "admin/content-types/:id/fieldId/:fieldId", component: ContentTypeEditComponent },
    { path: "admin/content-types/:id/fieldId/:fieldId", component: ContentTypeEditFieldComponent },
    { path: "admin/content", component: ContentComponent },
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
