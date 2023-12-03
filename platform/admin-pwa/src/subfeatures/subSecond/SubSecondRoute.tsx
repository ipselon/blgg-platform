import {ScrollArea} from '@/components/ui/scroll-area';
import {defer, useLoaderData, Await} from 'react-router-dom';
import {ProbeDataRequest, probeDataSingleton, ProbeData} from '@/data/ProbeData';
import React from 'react';
import {AwaitError} from '@/components/utils/AwaitError';

export interface SubSecondLoaderData {
    probeDataRequest: ProbeDataRequest;
}

export async function subSecondLoader() {
    return defer({
        probeDataRequest: probeDataSingleton.getData()
    });
}

export function SubSecondRoute() {
    const {probeDataRequest} = useLoaderData() as SubSecondLoaderData;
    return (
        <ScrollArea className="w-full h-full p-4 flex flex-col gap-2">
            <h1>Sub Second Route</h1>
            <div>
                <React.Suspense
                    fallback={<span>Loading...</span>}
                >
                    <Await
                        resolve={probeDataRequest}
                        errorElement={<AwaitError />}
                    >
                        {(probeData: ProbeData) => {
                            return <span>{probeData?.name || 'Undefined'}</span>
                        }}
                    </Await>
                </React.Suspense>
            </div>
        </ScrollArea>
    );
}