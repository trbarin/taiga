# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos Ventures SL

import pytest
from taiga.base.api.permissions import check_permissions
from taiga.exceptions import api as ex
from taiga.permissions import HasPerm, choices, services
from tests.utils import factories as f

pytestmark = pytest.mark.django_db


def test_is_project_admin_being_project_admin():
    project = f.create_project()
    assert services.is_project_admin(user=project.owner, obj=project) is True


def test_is_project_admin_being_project_member():
    project = f.ProjectFactory()

    user2 = f.UserFactory()
    general_member_role = f.RoleFactory(
        name="General",
        slug="general",
        permissions=choices.PROJECT_PERMISSIONS,
        is_admin=False,
        project=project,
    )
    f.MembershipFactory(user=user2, project=project, role=general_member_role)

    assert services.is_project_admin(user=user2, obj=project) is False


def test_is_project_admin_without_project():
    user = f.UserFactory()
    assert services.is_project_admin(user=user, obj=None) is False


def test_is_workspace_admin_being_workspace_admin():
    workspace = f.create_workspace()
    assert services.is_workspace_admin(user=workspace.owner, obj=workspace) is True


def test_is_workspace_admin_being_workspace_member():
    workspace = f.WorkspaceFactory()

    user2 = f.UserFactory()
    general_member_role = f.WorkspaceRoleFactory(
        name="General",
        slug="general",
        permissions=choices.WORKSPACE_PERMISSIONS,
        is_admin=False,
        workspace=workspace,
    )
    f.WorkspaceMembershipFactory(user=user2, workspace=workspace, workspace_role=general_member_role)

    assert services.is_workspace_admin(user=user2, obj=workspace) is False


def test_is_workspace_admin_without_workspace():
    user = f.UserFactory()
    assert services.is_workspace_admin(user=user, obj=None) is False


def test_user_has_perm_being_project_admin():
    project = f.create_project()
    perm = "modify_project"

    assert services.user_has_perm(user=project.owner, perm=perm, obj=project) is True


def test_user_has_perm_being_project_member():
    project = f.ProjectFactory()
    general_member_role = f.RoleFactory(
        name="General",
        slug="general",
        permissions=choices.PROJECT_PERMISSIONS,
        is_admin=False,
        project=project,
    )

    user2 = f.UserFactory()
    f.MembershipFactory(user=user2, project=project, role=general_member_role)

    perm = "modify_project"
    assert services.user_has_perm(user=user2, perm=perm, obj=project) is False

    perm = "view_project"
    assert services.user_has_perm(user=user2, perm=perm, obj=project) is True


def test_user_has_perm_not_being_project_member():
    project = f.create_project()

    user2 = f.UserFactory()
    perm = "modify_project"

    assert services.user_has_perm(user=user2, perm=perm, obj=project) is False


def test_user_has_perm_without_workspace_and_project():
    user = f.UserFactory()
    perm = "modify_project"

    assert services.user_has_perm(user=user, perm=perm, obj=None) is False


def test_user_has_perm_without_perm():
    project = f.create_project()
    assert services.user_has_perm(user=project.owner, perm=None, obj=project) is False


def test_check_permissions_success():
    project = f.create_project()
    permissions = HasPerm("modify_project")

    assert check_permissions(permissions=permissions, user=project.owner, obj=project) is None


def test_check_permissions_forbidden():
    project = f.create_project()

    user2 = f.UserFactory()
    permissions = HasPerm("modify_project")

    with pytest.raises(ex.ForbiddenError) as error:
        check_permissions(permissions=permissions, user=user2, obj=project)

    assert error.value.status_code == 403
    assert error.value.detail == "Forbidden"


@pytest.mark.parametrize(
    "permissions, expected",
    [
        (["view_tasks", "view_milestones"], False),
        (["comment_us", "view_project"], False),
        (["comment_task", "view_project"], False),
        (["view_us", "view_tasks", "view_milestones"], True),
        (["comment_us", "view_us"], True),
        (["view_us", "comment_task", "view_tasks"], True),
    ],
)
def test_permissions_are_compatible(permissions, expected):
    result = services.permissions_are_compatible(permissions)
    assert result == expected


@pytest.mark.parametrize(
    "permissions, expected",
    [
        (["view_tasks", "foo"], False),
        (["comment_us", "not_valid"], False),
        (["non_existent"], False),
        (["view_us", "view_tasks", "view_milestones"], True),
        (["comment_us", "view_us"], True),
        (["view_us", "comment_task", "view_tasks"], True),
        (["comment_task", "view_tasks"], True),
    ],
)
def test_permissions_are_valid(permissions, expected):
    result = services.permissions_are_valid(permissions)
    assert result == expected
