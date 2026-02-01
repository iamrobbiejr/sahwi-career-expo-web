import React from 'react';
import {useAuthStore} from '../../store';

const Can = ({perform, role, children, fallback = null}) => {
    const {hasRole, hasPermission} = useAuthStore();


    let canPerform = true;

    if (role && !hasRole(role)) {
        canPerform = false;
    }

    if (perform && !hasPermission(perform)) {
        canPerform = false;
    }

    if (!canPerform) {
        return fallback;
    }

    return <>{children}</>;
};

export default Can;