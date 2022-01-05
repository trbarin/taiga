# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos Ventures SL

import logging
from typing import List

from fastapi import Query
from taiga.auth.routing import AuthAPIRouter
from taiga.base.api import Request
from taiga.base.api.permissions import check_permissions
from taiga.exceptions import api as ex
from taiga.exceptions import services as services_ex
from taiga.exceptions.api.errors import ERROR_403, ERROR_404, ERROR_422
from taiga.permissions import IsProjectAdmin
from taiga.projects.api import get_project_or_404
from taiga.projects.models import Project
from taiga.projects.validators import PermissionsValidator
from taiga.roles import services as roles_services
from taiga.roles.serializers import RoleSerializer
from taiga.users.models import Role

logger = logging.getLogger(__name__)

metadata = {
    "name": "roles",
    "description": "Endpoint for roles, permissions and memberships resources.",
}

router = AuthAPIRouter(prefix="/projects", tags=["projects"])

# PERMISSIONS
GET_PROJECT_ROLES = IsProjectAdmin()
UPDATE_PROJECT_ROLE_PERMISSIONS = IsProjectAdmin()


@router.get(
    "/{slug}/roles",
    name="project.permissions.get",
    summary="Get project roles permissions",
    response_model=List[RoleSerializer],
    responses=ERROR_404 | ERROR_422 | ERROR_403,
)
def get_project_roles(
    request: Request, slug: str = Query(None, description="the project slug (str)")
) -> List[RoleSerializer]:
    """
    Get project roles and permissions
    """

    project = get_project_or_404(slug)
    check_permissions(permissions=GET_PROJECT_ROLES, user=request.user, obj=project)
    roles_permissions = roles_services.get_roles_permissions(project=project)
    return RoleSerializer.from_queryset(roles_permissions)


@router.put(
    "/{slug}/roles/{role_slug}/permissions",
    name="project.permissions.put",
    summary="Edit project roles permissions",
    response_model=RoleSerializer,
    responses=ERROR_404 | ERROR_422 | ERROR_403,
)
def update_project_role_permissions(
    request: Request,
    form: PermissionsValidator,
    slug: str = Query(None, description="the project slug (str)"),
    role_slug: str = Query(None, description="the role slug (str)"),
) -> RoleSerializer:
    """
    Edit project roles permissions
    """

    project = get_project_or_404(slug)
    check_permissions(permissions=UPDATE_PROJECT_ROLE_PERMISSIONS, user=request.user, obj=project)
    role = get_project_role_or_404(project=project, slug=role_slug)

    try:
        role = roles_services.update_role_permissions(role, form.permissions)
        return RoleSerializer.from_orm(role)
    except services_ex.NonEditableRoleError:
        logger.exception("Cannot edit permissions in an admin role")
        raise ex.ForbiddenError("Cannot edit permissions in an admin role")
    except services_ex.NotValidPermissionsSetError:
        logger.exception("One or more permissions are not valid. Maybe, there is a typo.")
        raise ex.BadRequest("One or more permissions are not valid. Maybe, there is a typo.")
    except services_ex.IncompatiblePermissionsSetError:
        logger.exception("Given permissions are incompatible")
        raise ex.BadRequest("Given permissions are incompatible")


def get_project_role_or_404(project: Project, slug: str) -> Role:
    role = roles_services.get_project_role(project=project, slug=slug)
    if role is None:
        logger.exception(f"Role {slug} does not exist")
        raise ex.NotFoundError()

    return role