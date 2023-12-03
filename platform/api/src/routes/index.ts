import { Router } from 'express';

import auth from './post-sys-user-auth';
import authRefresh from './post-sys-user-auth-refresh';
import authResetConfirm from './post-sys-user-auth-reset-confirm';
import authResetStart from './post-sys-user-auth-reset-start';
import authSignUpConfirm from './post-sys-user-auth-signup-confirm';

import probeData from './get-probe-data';
import getSysUserProfile from './get-sys-user-profile';
import postSysUserProfile from './post-sys-user-profile';

const router = Router();

router.use(auth);
router.use(authRefresh);
router.use(authResetConfirm);
router.use(authResetStart);
router.use(authSignUpConfirm);

router.use(probeData);
router.use(getSysUserProfile);
router.use(postSysUserProfile);

export default router;