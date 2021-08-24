/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '@/app/features/auth/login/login.component';
import { AuthModule } from '@/app/features/auth/auth.module';

const routes: Routes = [
  { path: '', component: LoginComponent }
];

@NgModule({
  declarations: [

  ],
  imports: [
    AuthModule,
    RouterModule.forChild(routes),
  ],
})
export class AuthPageModule { }
