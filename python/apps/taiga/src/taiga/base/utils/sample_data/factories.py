# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos Ventures SL


import random
from datetime import timezone
from decimal import Decimal
from uuid import UUID

from asgiref.sync import sync_to_async
from faker import Faker
from fastapi import UploadFile
from taiga.base.utils.sample_data import constants
from taiga.permissions import choices
from taiga.projects.invitations import repositories as pj_invitations_repositories
from taiga.projects.invitations.choices import ProjectInvitationStatus
from taiga.projects.invitations.models import ProjectInvitation
from taiga.projects.memberships import repositories as pj_memberships_repositories
from taiga.projects.projects import services as projects_services
from taiga.projects.projects.models import Project
from taiga.projects.references import get_new_project_reference_id
from taiga.projects.roles.models import ProjectRole
from taiga.stories.assignments.models import StoryAssignment
from taiga.stories.stories.models import Story
from taiga.users.models import User
from taiga.workflows.models import WorkflowStatus
from taiga.workspaces.roles.models import WorkspaceRole
from taiga.workspaces.workspaces import services as workspaces_services
from taiga.workspaces.workspaces.models import Workspace

fake: Faker = Faker()
Faker.seed(0)
random.seed(0)


################################
# USERS
################################


@sync_to_async
def create_user_with_kwargs(
    username: str, full_name: str | None = None, email: str | None = None, color: int | None = None
) -> User:
    if not full_name:
        full_name = fake.name()
    if not email:
        email = f"{username}@taiga.demo"
    color = color or fake.random_int(min=1, max=constants.NUM_USER_COLORS)
    user = User.objects.create(username=username, email=email, full_name=full_name, color=color, is_active=True)
    user.set_password("123123")
    user.save()
    return user


################################
# WORKSPACES
################################


async def get_workspace_with_related_info(id: UUID) -> Workspace:
    return await (Workspace.objects.select_related().prefetch_related("roles").aget(id=id))


@sync_to_async
def create_workspace_role(workspace: Workspace) -> WorkspaceRole:
    return WorkspaceRole.objects.create(
        workspace=workspace, name="Members", is_admin=False, permissions=choices.WorkspacePermissions.values
    )


async def create_workspace(
    owner: User, name: str | None = None, color: int | None = None, is_premium: bool = False
) -> Workspace:
    name = name or fake.bs()[:35]
    if is_premium:
        name = f"{name}(P)"
    color = color or fake.random_int(min=1, max=constants.NUM_WORKSPACE_COLORS)

    workspace = await workspaces_services._create_workspace(name=name, owner=owner, color=color)

    if is_premium:
        workspace.is_premium = True
        await sync_to_async(workspace.save)()
        # create non-admin role
        await create_workspace_role(workspace=workspace)
    return workspace


################################
# PROJECTS
################################


async def get_project_with_related_info(id: UUID) -> Project:
    return await (
        Project.objects.select_related()
        .prefetch_related(
            "roles",
            "members",
            "memberships",
            "memberships__user",
            "memberships__role",
            "workflows",
            "workflows__statuses",
        )
        .aget(id=id)
    )


async def create_project(
    workspace: Workspace, owner: User, name: str | None = None, description: str | None = None
) -> Project:
    name = name or fake.catch_phrase()
    description = description or fake.paragraph(nb_sentences=2)
    with open("src/taiga/base/utils/sample_data/media/logo.png", "rb") as png_image_file:
        logo_file = UploadFile(file=png_image_file, filename="Logo")

        return await projects_services._create_project(
            name=name,
            description=description,
            color=fake.random_int(min=1, max=constants.NUM_PROJECT_COLORS),
            owner=owner,
            workspace=workspace,
            logo=random.choice([None, logo_file]),
        )


async def create_project_memberships(project_id: UUID, users: list[User]) -> None:
    project = await get_project_with_related_info(project_id)

    # get admin and other roles
    other_roles = [r for r in project.roles.all() if r.slug != "admin"]
    admin_role = await project.roles.aget(slug="admin")

    # get users except the owner of the project
    users = [u for u in users if u.id != project.owner_id]

    # calculate admin (at least 1/3 of the members) and no admin users
    num_admins = random.randint(0, len(users) // 3)
    for user in users[:num_admins]:
        await pj_memberships_repositories.create_project_membership(user=user, project=project, role=admin_role)

    if other_roles:
        for user in users[num_admins:]:
            role = random.choice(other_roles)
            await pj_memberships_repositories.create_project_membership(user=user, project=project, role=role)


async def create_project_membership(project: Project, user: User, role: ProjectRole) -> None:
    await pj_memberships_repositories.create_project_membership(user=user, project=project, role=role)


async def create_project_invitations(project: Project, users: list[User]) -> None:
    # add accepted invitations for project memberships
    invitations = [
        ProjectInvitation(
            user=m.user,
            project=project,
            role=m.role,
            email=m.user.email,
            status=ProjectInvitationStatus.ACCEPTED,
            invited_by=project.owner,
        )
        for m in project.memberships.all()
        if m.user_id != project.owner_id
    ]

    # get no members
    members = list(project.members.all())
    no_members = [u for u in users if u not in members]
    random.shuffle(no_members)

    # get project roles
    roles = list(project.roles.all())

    # add 0, 1 or 2 pending invitations for registered users
    num_users = random.randint(0, 2)
    for user in no_members[:num_users]:
        invitations.append(
            ProjectInvitation(
                user=user,
                project=project,
                role=random.choice(roles),
                email=user.email,
                status=ProjectInvitationStatus.PENDING,
                invited_by=project.owner,
            )
        )

    # add 0, 1 or 2 pending invitations for unregistered users
    num_users = random.randint(0, 2)
    for i in range(num_users):
        invitations.append(
            ProjectInvitation(
                user=None,
                project=project,
                role=random.choice(roles),
                email=f"email-{i}@email.com",
                status=ProjectInvitationStatus.PENDING,
                invited_by=project.owner,
            )
        )

    # create invitations in bulk
    await pj_invitations_repositories.create_project_invitations(objs=invitations)


#################################
# STORIES
#################################


async def create_stories(
    project_id: UUID, min_stories: int = constants.NUM_STORIES_PER_WORKFLOW[0], max_stories: int | None = None
) -> None:
    project = await get_project_with_related_info(project_id)
    num_stories_to_create = fake.random_int(
        min=min_stories, max=max_stories or min_stories or constants.NUM_STORIES_PER_WORKFLOW[1]
    )
    members = list(project.members.all())
    workflows = list(project.workflows.all())

    # Create stories
    stories = []
    for workflow in workflows:
        statuses = list(workflow.statuses.all())

        for i in range(num_stories_to_create):
            stories.append(
                await _create_story(
                    status=random.choice(statuses),
                    owner=random.choice(members),
                    order=Decimal(i),
                    save=False,
                )
            )
    await Story.objects.abulk_create(stories)

    # Create story assignments
    story_assignments = []
    async for story in Story.objects.select_related().filter(project=project):

        if fake.random_number(digits=2) < constants.PROB_STORY_ASSIGNMENTS.get(
            story.status.slug.lower(), constants.PROB_STORY_ASSIGNMENTS_DEFAULT
        ):
            # Sometimes we assign all the members
            members_sample = (
                members if fake.boolean(chance_of_getting_true=10) else fake.random_sample(elements=members)
            )
            for member in members_sample:
                story_assignments.append(
                    StoryAssignment(
                        story=story,
                        user=member,
                        created_at=fake.date_time_between(start_date=story.created_at, tzinfo=timezone.utc),
                    )
                )

    await StoryAssignment.objects.abulk_create(story_assignments)


async def _create_story(
    status: WorkflowStatus, owner: User, order: Decimal, title: str | None = None, save: bool = True
) -> Story:
    _ref = await sync_to_async(get_new_project_reference_id)(status.workflow.project_id)
    _title = title or fake.text(max_nb_chars=random.choice(constants.STORY_TITLE_MAX_SIZE))
    _created_at = fake.date_time_between(start_date="-2y", tzinfo=timezone.utc)

    story = Story(
        ref=_ref,
        title=_title,
        order=order,
        created_at=_created_at,
        created_by_id=owner.id,
        project_id=status.workflow.project_id,
        workflow_id=status.workflow_id,
        status_id=status.id,
    )
    if save:
        sync_to_async(story.save)()

    return story