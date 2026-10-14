from is_kmp.consts.roles import ROLE_ADMIN
from is_kmp.exceptions.forbidden_exception import ForbiddenException
from is_kmp.models.company import Company


def check_admin(user_roles: list[str]):
    return check_role(user_roles, ROLE_ADMIN)


def check_role(user_roles: list[str], role: str):
    for user_role in user_roles:
        if user_role == role:
            return True
    return False


def check_have_access_to_company(user_company_id: int, company_id: int, user_roles: list[str]):
    if user_company_id == company_id or check_admin(user_roles):
        return

    have_access = False
    current_company_id = company_id

    while True:
        if not current_company_id:
            break

        if current_company_id == user_company_id:
            have_access = True
            break

        company = Company.objects.filter(id=current_company_id).first()

        current_company_id = company.parent_id if company else None

    if not have_access:
        raise ForbiddenException('Не доступа к данным')
