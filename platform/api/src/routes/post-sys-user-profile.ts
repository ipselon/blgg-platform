import {Router, Request, Response} from 'express';
import {verifyToken} from '../utility/SysUserTokenUtils';
import {createSysUserProfile} from '../utility/SysUserProfileUtils';

const router = Router();

router.post('/post-sys-user-profile', async (req: Request, res: Response) => {
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

    if (!req.body.profile) {
        res.status(500).send('Missing the profile data in the request');
        return;
    }
    try {
        const {profile} = req.body;
        await createSysUserProfile(decodedToken.sub, profile);
        res.status(200).send({});
    } catch (err: any) {
        console.error(err);
        res.status(500).send(`Updating user profile is failed. ${err.message}`);
    }
});

export default router;
