import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {SignUpRoute, signUpAction} from '@/roots/auth/SignUpRoute';
import {LoginRoute, loginAction} from '@/roots/auth/LoginRoute';
import {MainRoute, mainLoader, mainAction} from '@/roots/main/MainRoute';
import {FirstRoute} from '@/features/first/FirstRoute';
import {SecondRoute} from '@/features/second/SecondRoute';
import {SubFirstRoute} from '@/subfeatures/subFirst/SubFirstRoute';
import {SubSecondRoute, subSecondLoader} from '@/subfeatures/subSecond/SubSecondRoute';
import {SubThirdRoute} from '@/subfeatures/subThird/SubThirdRoute';
import {SubFourthRoute} from '@/subfeatures/subFourth/SubFourthRoute';
import {PasswordRecoveryRoute, passwordRecoveryAction} from '@/roots/auth/PasswordRecoveryRoute';
import {PasswordResetConfirmRoute} from '@/roots/auth/PasswordResetConfirmRoute';
import {PasswordResetRoute, passwordResetAction} from '@/roots/auth/PasswordResetRoute';
import {SettingsRoute} from '@/features/settings/SettingsRoute';
import {
    SysUserProfileRoute,
    sysUserProfileAction,
    sysUserProfileLoader
} from '@/subfeatures/sysUserProfile/SysUserProfileRoute';

const router = createBrowserRouter([
    {
        id: 'main',
        path: '/',
        element: <MainRoute />,
        loader: mainLoader,
        action: mainAction,
        children: [
            {
                path: 'settings',
                element: <SettingsRoute />,
                children: [
                    {
                        path: 'sys-user-profile',
                        action: sysUserProfileAction,
                        loader: sysUserProfileLoader,
                        element: <SysUserProfileRoute />
                    }
                ]
            },
            {
                path: 'first',
                element: <FirstRoute />,
                children: [
                    {
                        path: 'sub-first',
                        element: <SubFirstRoute />
                    },
                    {
                        path: 'sub-second',
                        loader: subSecondLoader,
                        element: <SubSecondRoute />
                    }
                ]
            },
            {
                path: '/second',
                element: <SecondRoute />,
                children: [
                    {
                        path: 'sub-third',
                        element: <SubThirdRoute />
                    },
                    {
                        path: 'sub-fourth',
                        element: <SubFourthRoute />
                    }
                ]

            }
        ]
    },
    {
        path: '/sign-up',
        action: signUpAction,
        element: <SignUpRoute />
    },
    {
        path: '/login',
        action: loginAction,
        element: <LoginRoute />
    },
    {
        path: '/password-reset',
        action: passwordResetAction,
        element: <PasswordResetRoute />
    },
    {
        path: '/password-reset-confirm',
        element: <PasswordResetConfirmRoute />
    },
    {
        path: '/password-recovery',
        action: passwordRecoveryAction,
        element: <PasswordRecoveryRoute />
    }
], {basename: '/admin'});

if (import.meta.hot) {
    import.meta.hot.dispose(() => router.dispose());
}

export function App() {
    return (
        <RouterProvider
            router={router}
        />
    );
}
