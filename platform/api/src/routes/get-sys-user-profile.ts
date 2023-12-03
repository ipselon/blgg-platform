import {Router, Request, Response} from 'express';
import {verifyToken} from '../utility/SysUserTokenUtils';
import {UserProfile} from 'common-utils';
import {getSysUserProfile} from '../utility/SysUserProfileUtils';

const router = Router();

router.get('/get-sys-user-profile', async (req: Request, res: Response) => {

    const token = req.headers.xtoken as string;

    if (!token) {
        res.status(401).send('Missing auth token in the request.');
        return;
    }
    const {isValidToken, decodedToken} = await verifyToken(token);

    if (!isValidToken) {
        res.status(401).send('Unauthorized');
        return;
    }
    const userProfile: UserProfile | undefined = await getSysUserProfile(decodedToken.sub);
    res.status(200).json(userProfile || {});
});

export default router;
