/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
 */

import { createSelector } from '@ngrx/store';
import { Status } from '@taiga/data';
import { kanbanFeature } from '../reducers/kanban.reducer';

export const {
  selectLoadingWorkflows,
  selectLoadingStories,
  selectWorkflows,
  selectStories,
  selectCreateStoryForm,
  selectScrollToStory,
  selectEmpty,
  selectNewEventStories,
  selectPermissionsError,
  selectActiveA11yDragDropStory,
} = kanbanFeature;

export const selectStatusFormOpen = (statusSlug: Status['slug']) => {
  return createSelector(selectCreateStoryForm, (openForm) => {
    return statusSlug === openForm;
  });
};

export const selectStatusNewStories = (statusSlug: Status['slug']) => {
  return createSelector(
    selectScrollToStory,
    selectStories,
    (newStories, stories) => {
      const story = stories[statusSlug].find((story) => {
        if ('tmpId' in story) {
          return newStories.includes(story.tmpId);
        }

        return false;
      });

      if (story && 'tmpId' in story) {
        return story;
      }

      return null;
    }
  );
};
