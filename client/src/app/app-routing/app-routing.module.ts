import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "../components/home/home.component";
import { ContentTypesComponent } from "../components/content-types/content-types.component";
import { ContentTypeAddComponent } from "../components/content-types/content-type-add/content-type-add.component";
import { ContentTypeEditComponent } from "../components/content-types/content-type-edit/content-type-edit.component";

import { ContentComponent } from "../components/content/content.component";
import { FieldTypesComponent } from "../components/field-types/field-types.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "field-types", component: FieldTypesComponent },
  { path: "content-types", component: ContentTypesComponent },
  { path: "content-types/add", component: ContentTypeAddComponent },
  { path: "content-types/:id", component: ContentTypeEditComponent },
  { path: "content", component: ContentComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
