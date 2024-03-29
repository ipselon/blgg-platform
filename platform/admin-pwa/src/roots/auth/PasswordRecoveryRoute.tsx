import {useLocation, Form, LoaderFunctionArgs, useActionData, json, redirect, Link} from 'react-router-dom';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {ActionDataFieldError} from '@/components/utils/ActionDataFieldError';
import {AuthResponse} from 'common-utils';
import {post} from '@/utils/ClientApi';
import {ActionDataRequestError} from '@/components/utils/ActionDataRequestError';
import {sysUserDataSingleton} from '@/data/SysUserData';

const formSchema = z.object({
    verificationCode: z.string().min(2, {
        message: "Verification code must be at least 2 characters.",
    }),
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    newPassword: z.string().min(2, {
        message: "New password must be at least 2 characters.",
    }),
})

export async function passwordRecoveryAction({request}: LoaderFunctionArgs) {
    switch (request.method) {
        case "POST": {
            let formData = await request.formData();
            const data = Object.fromEntries(formData);
            const validationResult = formSchema.safeParse(data);
            if (!validationResult.success) {
                const formatted = validationResult.error.format();
                return json(formatted);
            }
            try {
                const authResponse = await post<AuthResponse>('/api/post-sys-user-auth-reset-confirm', data);
                if (authResponse) {
                    await sysUserDataSingleton.setData({
                        userAttributes: authResponse.userAttributes,
                        userToken: authResponse.userToken
                    });
                    return redirect('/');
                }
                return json({error: 'Missing auth response'});
            } catch (e: any) {
                return json({error: e.message});
            }
        }
        default: {
            throw new Response("", {status: 405});
        }
    }
}

export function PasswordRecoveryRoute() {
    let location = useLocation();
    const actionData = useActionData();
    let params = new URLSearchParams(location.search);
    const code = params.get('code');
    const username = params.get('username');
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
            <Form method="post">
                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle>Password Recovery</CardTitle>
                        <CardDescription>Create new password for your account</CardDescription>
                        <ActionDataRequestError actionData={actionData} />
                        <ActionDataFieldError actionData={actionData} fieldName="verificationCode"/>
                        <ActionDataFieldError actionData={actionData} fieldName="username"/>
                    </CardHeader>
                    <CardContent>
                        <div className="grid w-full items-center gap-6">
                            <input name="verificationCode" hidden={true} defaultValue={code || ''}/>
                            <input name="username" hidden={true} defaultValue={username || ''}/>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input type="password" name="newPassword"/>
                                <ActionDataFieldError actionData={actionData} fieldName="newPassword"/>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" asChild={true}>
                            <Link to="/login">Back To Login</Link>
                        </Button>
                        <Button type="submit">Submit</Button>
                    </CardFooter>
                </Card>
            </Form>
        </div>
    );
}
