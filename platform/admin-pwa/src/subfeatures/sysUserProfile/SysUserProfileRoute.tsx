import {ScrollArea} from '@/components/ui/scroll-area';
import {SysUserProfileDataRequest, sysUserProfileDataSingleton, SysUserProfileData} from '@/data/SysUserProfileData';
import {defer, useLoaderData, Await, LoaderFunctionArgs, json} from 'react-router-dom';
import {AwaitError} from '@/components/utils/AwaitError';
import React from 'react';
import {SysUserProfileForm} from '@/subfeatures/sysUserProfile/SysUserProfileForm';
import * as z from 'zod';

export type SysUserProfileRouteResponse = {
    sysUserProfileDataRequest: SysUserProfileDataRequest;
};

const formSchema = z.object({
    email: z.string().min(2, {
        message: "Email must be at least 2 characters.",
    }),
    fullName: z.string().min(2, {
        message: "Full name must be at least 2 characters.",
    }),
});

export async function sysUserProfileLoader() {
    return defer({
        sysUserProfileDataRequest: sysUserProfileDataSingleton.getData()
    });
}

export async function sysUserProfileAction({request}: LoaderFunctionArgs) {
    switch (request.method) {
        case "POST": {
            let formData = await request.formData();
            const data = Object.fromEntries(formData);
            const validationResult = formSchema.safeParse(data);
            console.log('DATA: ', data);
            console.log('Validation: ', validationResult);
            if (!validationResult.success) {
                const formatted = validationResult.error.format();
                return json(formatted);
            }
            try {
                await sysUserProfileDataSingleton.setData(data as SysUserProfileData);
            } catch (e: any) {
                return json({error: e.message});
            }
            return json({ok: true});
        }
        default: {
            throw new Response("", {status: 405});
        }
    }
}

export function SysUserProfileRoute() {
    const {sysUserProfileDataRequest} = useLoaderData() as SysUserProfileRouteResponse;
    return (
        <ScrollArea className="w-full h-full p-4">
            <React.Suspense fallback={<SysUserProfileForm />}>
                <Await
                    resolve={sysUserProfileDataRequest}
                    errorElement={<AwaitError/>}
                >
                    {(sysUserProfileData: SysUserProfileData) => {
                        return (
                            <SysUserProfileForm
                                sysUserProfileData={sysUserProfileData}
                            />
                        );
                    }}
                </Await>
            </React.Suspense>
        </ScrollArea>
    );
}