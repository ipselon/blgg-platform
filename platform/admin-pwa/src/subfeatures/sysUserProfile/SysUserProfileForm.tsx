import {useFetcher, Link} from "react-router-dom";
import {SysUserProfileData} from '@/data/SysUserProfileData';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import React from 'react';
import {Button} from '@/components/ui/button';
import {ActionDataRequestError} from '@/components/utils/ActionDataRequestError';
import {ActionDataFieldError} from '@/components/utils/ActionDataFieldError';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/card';

interface SysUserProfileFormProps {
    sysUserProfileData?: SysUserProfileData;
}

export function SysUserProfileForm(props: SysUserProfileFormProps) {
    const {sysUserProfileData} = props;
    const fetcher = useFetcher();
    console.log('SysUserProfileForm fetcher: ', fetcher);
    return (
        <fetcher.Form method="post">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardDescription>System User Profile</CardDescription>
                    <ActionDataRequestError actionData={fetcher.data}/>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                name="email"
                                type="text"
                                autoFocus={true}
                                disabled={!sysUserProfileData}
                                defaultValue={sysUserProfileData?.email || ''}
                            />
                            <ActionDataFieldError actionData={fetcher.data} fieldName="email"/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                name="fullName"
                                type="text"
                                disabled={!sysUserProfileData}
                                defaultValue={sysUserProfileData?.fullName || ''}
                            />
                            <ActionDataFieldError actionData={fetcher.data} fieldName="fullName"/>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!sysUserProfileData}
                    >
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </fetcher.Form>
    );
}