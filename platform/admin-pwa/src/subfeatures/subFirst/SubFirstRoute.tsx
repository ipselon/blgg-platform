import React from 'react';
import {ScrollArea} from '@/components/ui/scroll-area';
import {useRouteLoaderData, Await} from 'react-router-dom';
import {MainRouteLoaderResponse} from '@/roots/main/MainRoute';
import {AwaitError} from '@/components/utils/AwaitError';
import {SysUserData} from '@/data/SysUserData';

export function SubFirstRoute() {
    const {sysUserDataRequest} = useRouteLoaderData('main') as MainRouteLoaderResponse;
    console.log(sysUserDataRequest);
    return (
        <ScrollArea className="w-full h-full p-4 flex flex-col gap-2">
            <h1>Sub First Route</h1>
            <div>
                <React.Suspense
                    fallback={<span>Loading...</span>}
                >
                    <Await
                        resolve={sysUserDataRequest}
                        errorElement={<AwaitError />}
                    >
                        {(sysUserData: SysUserData) => {
                            return (
                                <span>
                                    {sysUserData.userAttributes?.name || 'Undefined'}
                                </span>);
                        }}
                    </Await>
                </React.Suspense>
            </div>
        </ScrollArea>
    );
}