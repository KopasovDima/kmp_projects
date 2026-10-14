import {ROLES} from '@/consts'

export const checkRole = (userRoles: any[] = [], role: string) => {
    return userRoles?.some((userRole) => userRole.id === role)
}

export const checkAdmin = (userRoles: any[] = []) => {
    return checkRole(userRoles, ROLES.ROLE_ADMIN)
}

export const checkITSpecialist = (userRoles: any[] = []) => {
    return checkRole(userRoles, ROLES.ROLE_IT_SPECIALIST)
}

export const checkITSpecialistOrAdmin = (userRoles: any[] = []) => {
    return checkAdmin(userRoles) || checkITSpecialist(userRoles)
}

export const checkEconomist = (userRoles: any[] = []) => {
    return checkRole(userRoles, ROLES.ROLE_ECONOMIST)
}

export const checkEconomistOrAdmin = (userRoles: any[] = []) => {
    return checkAdmin(userRoles) || checkEconomist(userRoles)
}

export const checkBFManager = (userRoles: any[] = []) => {
    return checkRole(userRoles, ROLES.ROLE_BF_MANAGER)
}

export const checkBFManagerAdmin = (userRoles: any[] = []) => {
    return checkAdmin(userRoles) || checkBFManager(userRoles)
}
