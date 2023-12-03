import {UserToken, AuthRefreshResponse} from 'common-utils';
import {getStorageRecord, setStorageRecord} from '@/utils/localStorage';
import {post} from './ClientApi';

let userToken: UserToken | undefined;

const delta: number = 5 * 60 * 1000; // 5 minutes
let isRefreshing: boolean = false;

export function isExpired(expirationTimeUTC: number | undefined): boolean {
    if (expirationTimeUTC) {
        const expireAt = new Date(expirationTimeUTC);
        return (expireAt.getTime() - Date.now()) < delta;
    }
    return true;
}

export async function sleep(timeout: number) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export async function getAuthToken(): Promise<string | undefined> {
    if (isRefreshing) {
        let timesCounter: number = 0;
        while (isRefreshing && timesCounter < 30) {
            await sleep(100);
            timesCounter++;
        }
    }
    if (!userToken || isExpired(userToken.expiredAt)) {
        isRefreshing = true;
        const savedUserToken: UserToken | undefined = await getStorageRecord('userToken', 'auth');
        if (savedUserToken) {
            if (isExpired(savedUserToken.expiredAt)) {
                const refreshResponse: AuthRefreshResponse | undefined = await post<AuthRefreshResponse>('/api/post-sys-user-auth-signup-confirm', {
                    username: savedUserToken.username,
                    refreshToken: savedUserToken.refreshToken
                });
                if (refreshResponse) {
                    await setStorageRecord('userToken', refreshResponse.userToken, 'auth');
                    userToken = refreshResponse.userToken;
                }
            } else {
                userToken = savedUserToken;
            }
            isRefreshing = false;
        }
    }
    if (!userToken) {
        return undefined;
    }
    // console.log('Get auth token: ', userToken.accessToken);
    return userToken.accessToken;
}

export async function logout(): Promise<void> {
    userToken = undefined;
    await setStorageRecord('userAttributes', null, 'auth');
    await setStorageRecord('userToken', null, 'auth');

}
