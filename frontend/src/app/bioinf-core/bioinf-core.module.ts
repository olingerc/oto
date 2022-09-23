import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { BioinfHttpService } from '../bioinf-core/services/bioinf-http.service';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [],
  providers: [
    BioinfHttpService
  ],
  exports: []
})
export class BioinfCoreModule { }
