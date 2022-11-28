/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
 */

import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoryDetailEffects } from './+state/effects/story-detail.effects';
import { storyDetailFeature } from './+state/reducers/story-detail.reducer';

@NgModule({
  imports: [
    StoreModule.forFeature(storyDetailFeature),
    EffectsModule.forFeature([StoryDetailEffects]),
  ],
})
export class DataAccessStoryDetailModule {}
