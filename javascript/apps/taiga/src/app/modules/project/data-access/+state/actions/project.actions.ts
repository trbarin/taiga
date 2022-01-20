/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
 */

import { createAction, props } from '@ngrx/store';
import { Project, Role } from '@taiga/data';

export const fetchProjectSuccess = createAction(
  '[Project] fetch success',
  props<{project: Project}>()
);

export const fetchProject = createAction(
  '[Project] fetch',
  props<{slug: Project['slug']}>()
);

export const fetchMemberRoles = createAction(
  '[Member Roles] fetch members',
  props<{slug: Project['slug']}>()
);

export const fetchMemberRolesSuccess = createAction(
  '[Roles] fetch members success',
  props<{roles: Role[]}>()
);

export const fetchPublicRoles = createAction(
  '[Member Roles] fetch public',
  props<{slug: Project['slug']}>()
);

export const fetchPublicRolesSuccess = createAction(
  '[Roles] fetch public success',
  props<{publicRole: string[]}>()
);

export const updateRolePermissions = createAction(
  '[Roles] update role permissions',
  props<{project: Project['slug'], roleSlug: Role['slug'], permissions: string[]}>()
);

export const updatePublicRolePermissions = createAction(
  '[Roles] update public role permissions',
  props<{project: Project['slug'], permissions: string[]}>()
);

export const updateRolePermissionsSuccess = createAction(
  '[Roles] update role permissions success',
);

export const updateRolePermissionsError = createAction(
  '[Roles] update role permissions error',
);
