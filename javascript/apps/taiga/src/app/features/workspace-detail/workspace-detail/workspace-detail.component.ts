/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { RxState } from '@rx-angular/state';

interface ComponentViewModel {
  todo: string;
}

@Component({
  selector: 'tg-workspace-detail',
  templateUrl: './workspace-detail.component.html',
  styleUrls: ['./workspace-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RxState]
})
export class WorkspaceDetailComponent {

  public readonly todo$ = this.state.select('todo');
  public readonly model$ = this.state.select();

  constructor(
    private store: Store,
    private state: RxState<ComponentViewModel>,
  ) {
    // initial state
    // this.state.set({});

    // connect the ngrx state with the local state
    // this.state.connect('todo', this.store.select(selectTodo));
  }

}
