import { RouterModule } from '@angular/router';
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
 */

import { WorkspaceAvatarModule } from './../../shared/workspace-avatar/workspace-avatar.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceComponent } from './workspace/workspace.component';
import { TuiButtonModule, TuiLinkModule, TuiSvgModule } from '@taiga-ui/core';
import { TranslocoModule } from '@ngneat/transloco';
import { InputsModule } from 'libs/ui/src/lib/inputs/inputs.module';
import { WorkspaceCreateComponent } from './workspace-create/workspace-create.component';
import { WorkspaceItemComponent } from './workspace-item/workspace-item.component';
import { TuiAvatarModule } from '@taiga-ui/kit';
import { WorkspaceSkeletonComponent } from './workspace-skeleton/workspace-skeleton.component';
import { BadgeModule } from 'libs/ui/src/lib/badge/badge.module';
import { SkeletonsModule } from 'libs/ui/src/lib/skeletons/skeletons.module';

@NgModule({
  declarations: [
    WorkspaceComponent,
    WorkspaceCreateComponent,
    WorkspaceItemComponent,
    WorkspaceSkeletonComponent
  ],
  imports: [
    CommonModule,
    TuiButtonModule,
    TuiSvgModule,
    TranslocoModule,
    TuiLinkModule,
    InputsModule,
    TuiAvatarModule,
    WorkspaceAvatarModule,
    SkeletonsModule,
    BadgeModule,
    RouterModule
  ],
  exports: [
    WorkspaceComponent,
    WorkspaceCreateComponent,
    WorkspaceItemComponent
  ]
})
export class WorkspaceModule { }
