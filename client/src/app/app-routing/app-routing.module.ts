import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "../components/home/home.component";
import { ContentTypesComponent } from "../components/content-types/content-types.component";
import { ContentTypeEditComponent } from "../components/content-type-edit/content-type-edit.component";

import { ContentComponent } from "../components/content/content.component";
import { FieldTypesComponent } from "../components/field-types/field-types.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "field-types", component: FieldTypesComponent },
  { path: "content-types", component: ContentTypesComponent },
  { path: "content-types-edit/:id", component: ContentTypeEditComponent },
  { path: "content", component: ContentComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
