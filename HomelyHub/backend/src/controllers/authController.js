import { User } from '../Models/userModel.js';
import { promisify } from 'node:util';
import a0a from 'jsonwebtoken';
import a0b from 'crypto';
import a0c from '../utils/ImagekitIO.js';
import {
    forgotPasswordMailGenContent,
    sendMail
} from '../utils/mail.js';

const signinToken = a => {
    return a0a['sign']({ 'id': a }, process['env']['JWT_SECRET'], { 'expiresIn': process['env']['JWT_EXPIRES_IN'] });
},

createSendToken = (a, b, c) => {
    const d = signinToken(a['_id']),
        e = {
            'expires': new Date(Date['now']() + process['env']['JWT_COOKIE_EXPIRES_IN'] * 24 * 60 * 60 * 1000),
            'httpOnly': true,
            'sameSite': "none",
            'secure': true
        };

    c['cookie']('jwt', d, e);
    a['password'] = undefined;

    c['status'](b)['json']({
        'status': 'Success',
        'token': d,
        'user': a
    });
},

defaultAvatarUrl = 'https://i.pravatar.cc/150?img=3\n',

filterObj = (a, ...b) => {
    let c = {};
    Object['keys'](a)['forEach'](d => {
        if (b['includes'](d)) c[d] = a[d];
    });
    return c;
},

signup = async (a, b) => {
    try {
        const c = await User['create']({
            'name': a['body']['name'],
            'email': a['body']['email'],
            'phoneNumber': a['body']['phoneNumber'],
            'password': a['body']['password'],
            'passwordConfirm': a['body']['passwordConfirm'],
            'avatar': { 'url': a['body']['avatar'] || defaultAvatarUrl }
        });
        createSendToken(c, 0xc9, b);
    } catch (d) {
        b['status'](0x190)['json']({ 'message': d['message'] });
    }
},

login = async (a, b) => {
    try {
        const { email: c, password: d } = a['body'];
        if (!c || !d)
            throw new Error('Please Provide email and password');

        const e = await User['findOne']({ 'email': c })['select']('+password');
        if (!e || await e['correctPassword'](d, e['password']) === ![])
            throw new Error('Incorrect email or password');

        createSendToken(e, 0xc8, b);
    } catch (f) {
        b['status'](0x190)['json']({
            'status': 'fail',
            'message': f['message']
        });
    }
},

logout = (a, b) => {
    const c = {
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/"
    };

    b.cookie('jwt', '', c);
    b.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
},

protect = async (a, b, c) => {
    try {
        let d;

        if (a['headers']['authorization'] && a['headers']['authorization']['startsWith']('Bearer'))
            d = a['headers']['authorization']['split'](' ')[1];
        else if (a['cookies']['jwt'] && a['cookies']['jwt'] !== 'loggedout')
            d = a['cookies']['jwt'];

        if (!d)
            throw new Error('You are not logged in!! Please login to access');

        const e = await promisify(a0a['verify'])(d, process['env']['JWT_SECRET']);
        const f = await User['findById'](e['id']);

        if (!f)
            throw new Error("the user belonging to the token doesn't exists");

        if (f['changedPasswordAfter'](e['iat']))
            throw new Error('user recently changed the password, Please login again');

        a['user'] = f;
        c();
    } catch (g) {
        b['status'](0x191)['json']({
            'status': 'fail',
            'message': g['message']
        });
    }
},

updateMe = async (a, b) => {
    try {
        const c = filterObj(a['body'], 'name', 'phoneNumber', 'avatar');

        if (a['body']['avatar'] !== undefined) {
            let e = a['body']['avatar'];
            const f = await a0c['upload']({
                'file': e,
                'fileName': 'avatar_' + Date['now']() + '.jpg',
                'folder': 'avatars'
            });

            c['avatar'] = {
                'public_id': f['fileId'],
                'url': f['url']
            };
        }

        const d = await User['findByIdAndUpdate'](a['user']['id'], c, {
            'new': !![],
            'runValidators': !![],
            'useFindAndModify': ![]
        });

        b['status'](0xc8)['json']({
            'status': 'Success',
            'data': { 'user': d }
        });
    } catch (g) {
        b['status'](0x191)['json']({
            'status': 'Fail',
            'message': g['message']
        });
    }
},

updatePassword = async (a, b) => {
    try {
        const c = await User['findById'](a['user']['id'])['select']('+password');

        if (!await c['correctPassword'](a['body']['passwordCurrent'], c['password']))
            throw new Error('Your current password is wrong');

        c['password'] = a['body']['password'];
        c['passwordConfirm'] = a['body']['passwordConfirm'];

        await c['save']();
        createSendToken(c, 0xc8, b);
    } catch (d) {
        b['status'](0x194)['json']({
            'status': 'fail',
            'message': d['message']
        });
    }
},

forgotPassword = async (a, b) => {
    const c = await User['findOne']({ 'email': a['body']['email'] });
    if (!c)
        return b['status'](0x190)['json']({ 'error': 'There is no user with this email' });

    const d = c['createPasswordResetToken']();
    await c['save']({ 'validateBeforeSave': ![] });

    const e = 'http://localhost:5173/user/resetPassword/' + d;

    try {
        await sendMail({
            'email': c['email'],
            'subject': 'Reset your Password (valid for 10 mins)',
            'mailGenContent': forgotPasswordMailGenContent(c['name'], e)
        });

        b['status'](0xc8)['json']({
            'status': 'success',
            'message': 'Token sent successfully'
        });
    } catch (f) {
        b['status'](0x190)['json']({ 'error': f['message'] });
    }
},

resetPassword = async (a, b) => {
    try {
        const c = a0b['createHash']('sha256')['update'](a['params']['token'])['digest']('hex');

        const d = await User['findOne']({
            'passwordResetToken': c,
            'passwordResetExpires': { '$gt': Date['now']() }
        });

        if (!d)
            throw new Error('Token is invalid or expired');

        d['password'] = a['body']['password'];
        d['passwordConfirm'] = a['body']['passwordConfirm'];
        d['passwordResetToken'] = undefined;
        d['passwordResetExpires'] = undefined;

        await d['save']();
        createSendToken(d, 0xc8, b);
    } catch (e) {
        b['status'](0x190)['json']({
            'status': 'fail',
            'error': e['message']
        });
    }
},

check = async (a, b) => {
    try {
        b['status'](0xc8)['json']({
            'status': 'success',
            'message': 'Logged In',
            'user': a['user']
        });
    } catch (c) {
        b['status'](0x190)['json']({
            'status': 'fail',
            'message': 'UnAuthorised'
        });
    }
};

export {
    signup,
    login,
    logout,
    protect,
    updateMe,
    resetPassword,
    forgotPassword,
    updatePassword,
    check
};
