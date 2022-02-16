/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
 */

import { FormControl, FormGroup } from '@angular/forms';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';

import { ProjectsSettingsFeatureRolesPermissionsService } from './feature-roles-permissions.service';

describe('ProjectsSettingsFeatureRolesPermissionsService', () => {
  let spectator: SpectatorService<ProjectsSettingsFeatureRolesPermissionsService>;
  const createService = createServiceFactory({
    service: ProjectsSettingsFeatureRolesPermissionsService,
  });

  beforeEach(() => (spectator = createService()));

  describe('apply permission to formGroup', () => {
    it('no access - disable form', () => {
      const formGroup = new FormGroup({
        create: new FormControl(false),
        edit: new FormControl(false),
        delete: new FormControl(false),
        comment: new FormControl(false),
      });

      spectator.service.applyPermission('wiki', 'no_access', formGroup);

      expect(formGroup.disabled).toBeTruthy();
    });

    it('enable former no access form', () => {
      const formGroup = new FormGroup({
        create: new FormControl(false),
        edit: new FormControl(false),
        delete: new FormControl(false),
        comment: new FormControl(false),
      });

      formGroup.disable();

      spectator.service.applyPermission('wiki', 'edit', formGroup);

      expect(formGroup.disabled).toBeFalsy();
    });

    it('edit - create, modify, delete change to true', () => {
      const formGroup = new FormGroup({
        create: new FormControl(false),
        modify: new FormControl(false),
        delete: new FormControl(false),
        comment: new FormControl(false),
      });

      spectator.service.applyPermission('userstories', 'edit', formGroup);

      expect(formGroup.value).toEqual({
        create: true,
        modify: true,
        delete: true,
        comment: false,
      });
    });

    it('modules without comments', () => {
      const formGroup = new FormGroup({
        create: new FormControl(false),
        modify: new FormControl(false),
        delete: new FormControl(false),
        comment: new FormControl(false),
      });

      // userstories has comments
      spectator.service.applyPermission('userstories', 'edit', formGroup);

      expect(formGroup.get('comment')!.disabled).toBeFalsy();

      // wiki don't have comments
      spectator.service.applyPermission('wiki', 'edit', formGroup);

      expect(formGroup.get('comment')!.disabled).toBeTruthy();
    });

    it('view - create, modify, delete change to false', () => {
      const formGroup = new FormGroup({
        create: new FormControl(true),
        modify: new FormControl(true),
        delete: new FormControl(true),
        comment: new FormControl(true),
      });

      spectator.service.applyPermission('userstories', 'view', formGroup);

      expect(formGroup.value).toEqual({
        create: false,
        modify: false,
        delete: false,
        comment: true,
      });
    });
  });

  describe('get formGroup permission state', () => {
    it('no access, form disabled', () => {
      const formGroup = new FormGroup({
        create: new FormControl(true),
        modify: new FormControl(true),
        delete: new FormControl(true),
        comment: new FormControl(true),
      });

      formGroup.disable();

      const permission = spectator.service.formPermissionState(formGroup);

      expect(permission).toBe('no_access');
    });

    it('edit, can create, modify, delete', () => {
      const formGroup = new FormGroup({
        create: new FormControl(true),
        modify: new FormControl(true),
        delete: new FormControl(true),
        comment: new FormControl(true),
      });

      const permission = spectator.service.formPermissionState(formGroup);

      expect(permission).toBe('edit');
    });

    it('view, can not create, modify, delete', () => {
      const formGroup = new FormGroup({
        create: new FormControl(false),
        modify: new FormControl(false),
        delete: new FormControl(false),
        comment: new FormControl(true),
      });

      const permission = spectator.service.formPermissionState(formGroup);

      expect(permission).toBe('view');
    });

    it('restricted, mixed true/false create, modify, delete', () => {
      const formGroup = new FormGroup({
        create: new FormControl(false),
        modify: new FormControl(true),
        delete: new FormControl(false),
        comment: new FormControl(true),
      });

      const permission = spectator.service.formPermissionState(formGroup);

      expect(permission).toBe('restricted');
    });
  });

  it('permission form to backend format - userstories', () => {
    const formGroup = new FormGroup({
      userstories: new FormGroup({
        create: new FormControl(true),
        modify: new FormControl(true),
        delete: new FormControl(true),
        comment: new FormControl(true),
      }),
    });

    let permission = spectator.service.getRoleFormGroupPermissions(formGroup);

    expect(permission).toEqual([
      'view_us',
      'add_us',
      'modify_us',
      'delete_us',
      'comment_us',
    ]);

    formGroup.setValue({
      userstories: {
        create: false,
        modify: false,
        delete: false,
        comment: false,
      },
    });

    permission = spectator.service.getRoleFormGroupPermissions(formGroup);

    expect(permission).toEqual(['view_us']);

    formGroup.disable();
    permission = spectator.service.getRoleFormGroupPermissions(formGroup);

    expect(permission).toEqual([]);
  });

  it('permission form to backend format - userstories disabled', () => {
    const formGroup = new FormGroup({
      userstories: new FormGroup({
        create: new FormControl(true),
        modify: new FormControl(true),
        delete: new FormControl(true),
        comment: new FormControl(true),
      }),
      tasks: new FormGroup({
        create: new FormControl(true),
        modify: new FormControl(true),
        delete: new FormControl(true),
        comment: new FormControl(true),
      }),
      sprints: new FormGroup({
        create: new FormControl(true),
        modify: new FormControl(true),
        delete: new FormControl(true),
        comment: new FormControl(true),
      }),
    });

    formGroup.get('userstories')?.disable();

    const permission = spectator.service.getRoleFormGroupPermissions(formGroup);

    expect(permission).toEqual([]);
  });

  it('format raw permissions to valid formGroup value', () => {
    const formGroup = new FormGroup({
      userstories: new FormGroup({
        create: new FormControl(false),
        modify: new FormControl(false),
        delete: new FormControl(false),
        comment: new FormControl(false),
      }),
    });

    const value = spectator.service.formatRawPermissions([
      'view_us',
      'add_us',
      'modify_us',
      'delete_us',
      'comment_us',
    ]);

    formGroup.patchValue(value);

    expect(formGroup.value).toEqual({
      userstories: {
        create: true,
        modify: true,
        delete: true,
        comment: true,
      },
    });
  });

  it('conflicts permissions: no conflicts between member and public', () => {
    const publicPermissions: any = {
      userstories: {
        view: true,
        comment: true,
      },
    };
    const memberPermissions: any = {
      userstories: {
        view: true,
        comment: true,
      },
    };
    const value = spectator.service.getConflictsPermissions(
      publicPermissions,
      memberPermissions
    );
    expect(value).toBeUndefined();
  });

  it('conflicts permissions: member(no-access) and public(view)', () => {
    const publicPermissions: any = {
      userstories: {
        view: true,
      },
    };
    const memberPermissions: any = {};
    const value: any = spectator.service.getConflictsPermissions(
      publicPermissions,
      memberPermissions
    )?.[0];
    const expectedValue = {
      name: 'userstories',
      permission: {
        member: [],
        onlyPublicPermission: ['view'],
        public: ['view'],
      },
      texts: {
        member: {
          restrictions: [],
          text: ['project_settings.roles_permissions.no_access'],
        },
        public: {
          restrictions: [],
          text: ['project_settings.roles_permissions.can_view'],
        },
      },
    };
    expect(value?.name).toEqual(expectedValue.name);
    expect(value?.permission.member).toEqual(
      expect.arrayContaining(expectedValue.permission.member)
    );
    expect(value?.permission.onlyPublicPermission).toEqual(
      expect.arrayContaining(expectedValue.permission.onlyPublicPermission)
    );
    expect(value?.permission.public).toEqual(
      expect.arrayContaining(expectedValue.permission.public)
    );
    expect(value?.texts.member.restrictions).toEqual(
      expect.arrayContaining(expectedValue.texts.member.restrictions)
    );
    expect(value?.texts.member.text).toEqual(
      expect.arrayContaining(expectedValue.texts.member.text)
    );
    expect(value?.texts.public.restrictions).toEqual(
      expect.arrayContaining(expectedValue.texts.public.restrictions)
    );
    expect(value?.texts.public.text).toEqual(
      expect.arrayContaining(expectedValue.texts.public.text)
    );
  });

  it('conflicts permissions: member(no-access) and public(view and comment)', () => {
    const publicPermissions: any = {
      userstories: {
        view: true,
        comment: true,
      },
    };
    const memberPermissions: any = {};
    const value: any = spectator.service.getConflictsPermissions(
      publicPermissions,
      memberPermissions
    )?.[0];
    const expectedValue = {
      name: 'userstories',
      permission: {
        member: [],
        onlyPublicPermission: ['view', 'comment'],
        public: ['view', 'comment'],
      },
      texts: {
        member: {
          restrictions: [],
          text: ['project_settings.roles_permissions.no_access'],
        },
        public: {
          restrictions: [],
          text: ['project_settings.roles_permissions.can_view'],
        },
      },
    };
    expect(value?.name).toEqual(expectedValue.name);
    expect(value?.permission.member).toEqual(
      expect.arrayContaining(expectedValue.permission.member)
    );
    expect(value?.permission.onlyPublicPermission).toEqual(
      expect.arrayContaining(expectedValue.permission.onlyPublicPermission)
    );
    expect(value?.permission.public).toEqual(
      expect.arrayContaining(expectedValue.permission.public)
    );
    expect(value?.texts.member.restrictions).toEqual(
      expect.arrayContaining(expectedValue.texts.member.restrictions)
    );
    expect(value?.texts.member.text).toEqual(
      expect.arrayContaining(expectedValue.texts.member.text)
    );
    expect(value?.texts.public.restrictions).toEqual(
      expect.arrayContaining(expectedValue.texts.public.restrictions)
    );
    expect(value?.texts.public.text).toEqual(
      expect.arrayContaining(expectedValue.texts.public.text)
    );
  });

  it('conflicts permissions: member(view) and public(edit)', () => {
    const publicPermissions: any = {
      userstories: {
        view: true,
        create: true,
        delete: true,
        modify: true,
        comment: true,
      },
    };
    const memberPermissions: any = {
      userstories: {
        view: true,
      },
    };
    const value = spectator.service.getConflictsPermissions(
      publicPermissions,
      memberPermissions
    )?.[0];

    const expectedValue: any = {
      name: 'userstories',
      permission: {
        member: ['view'],
        onlyPublicPermission: ['create', 'modify', 'delete', 'comment'],
        public: ['view', 'create', 'modify', 'delete', 'comment'],
      },
      texts: {
        member: {
          restrictions: [],
          text: [
            'project_settings.roles_permissions.can_view',
            'project_settings.roles_permissions.cannot_comment',
          ],
        },
        public: {
          restrictions: [],
          text: [
            'project_settings.roles_permissions.can_edit',
            'project_settings.roles_permissions.can_comment',
          ],
        },
      },
    };
    expect(value?.name).toEqual(expectedValue.name);
    expect(value?.permission.member).toEqual(
      expect.arrayContaining(expectedValue.permission.member)
    );
    expect(value?.permission.onlyPublicPermission).toEqual(
      expect.arrayContaining(expectedValue.permission.onlyPublicPermission)
    );
    expect(value?.permission.public).toEqual(
      expect.arrayContaining(expectedValue.permission.public)
    );
    expect(value?.texts.member.restrictions).toEqual(
      expect.arrayContaining(expectedValue.texts.member.restrictions)
    );
    expect(value?.texts.member.text).toEqual(
      expect.arrayContaining(expectedValue.texts.member.text)
    );
    expect(value?.texts.public.restrictions).toEqual(
      expect.arrayContaining(expectedValue.texts.public.restrictions)
    );
    expect(value?.texts.public.text).toEqual(
      expect.arrayContaining(expectedValue.texts.public.text)
    );
  });

  it('conflicts permissions: member(edit but cannot create) and public(edit)', () => {
    const publicPermissions: any = {
      userstories: {
        view: true,
        create: true,
        delete: true,
        modify: true,
        comment: true,
      },
    };
    const memberPermissions: any = {
      userstories: {
        view: true,
        delete: true,
        modify: true,
      },
    };
    const value = spectator.service.getConflictsPermissions(
      publicPermissions,
      memberPermissions
    )?.[0];

    const expectedValue: any = {
      name: 'userstories',
      permission: {
        member: ['view', 'modify', 'delete'],
        onlyPublicPermission: ['create', 'comment'],
        public: ['view', 'create', 'modify', 'delete', 'comment'],
      },
      texts: {
        member: {
          restrictions: ['project_settings.modal_permissions.cannot_create'],
          text: [
            'project_settings.roles_permissions.restricted',
            'project_settings.roles_permissions.cannot_comment',
          ],
        },
        public: {
          restrictions: ['project_settings.modal_permissions.can_create'],
          text: [
            'project_settings.roles_permissions.can_edit',
            'project_settings.roles_permissions.can_comment',
          ],
        },
      },
    };
    expect(value?.name).toEqual(expectedValue.name);
    expect(value?.permission.member).toEqual(
      expect.arrayContaining(expectedValue.permission.member)
    );
    expect(value?.permission.onlyPublicPermission).toEqual(
      expect.arrayContaining(expectedValue.permission.onlyPublicPermission)
    );
    expect(value?.permission.public).toEqual(
      expect.arrayContaining(expectedValue.permission.public)
    );
    expect(value?.texts.member.restrictions).toEqual(
      expect.arrayContaining(expectedValue.texts.member.restrictions)
    );
    expect(value?.texts.member.text).toEqual(
      expect.arrayContaining(expectedValue.texts.member.text)
    );
    expect(value?.texts.public.restrictions).toEqual(
      expect.arrayContaining(expectedValue.texts.public.restrictions)
    );
    expect(value?.texts.public.text).toEqual(
      expect.arrayContaining(expectedValue.texts.public.text)
    );
  });
});