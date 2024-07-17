import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';


const router = express.Router();


dotenv.config();
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        return res.json({ msg: 'user already existed' });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,
        email,
        password: hashpassword
    })

    const data = await newUser.save();
    console.log(data)
    return res.json({ status: true, msg: 'record registered' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.json({ message: 'user is not registered' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.json({ message: 'password is incorrect' });
    }
    const token = jwt.sign({ username: user.username }, process.env.KEY, { expiresIn: '5m' });
    res.cookie('token', token, { httpOnly: true, maxAge: 5 * 60 * 1000 });
    return res.json({ status: 'true', msg: 'login successfully' });

})

router.post('/forgotpassword', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'user not registered' });
        }

        const token = jwt.sign({ email: user.email }, process.env.KEY, { expiresIn: '1h' });
        // console.log(`forgot token is ${token}`)
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD

            }
        });

        var mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Reset Password',
            text: `http://localhost:5173/resetpassword/${token}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.json({ message: 'error sending email' });
            } else {
                console.log({ status: true, message: 'email sent' });
            }
        });
    } catch (error) {
        console.log(error);
    }
})


router.post('/resetpassword/:token', async (req, res) => {
    const token = req.params.token;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.KEY);
        const email = decoded.email;
        const hashPassword = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate({ email }, { password: hashPassword });
        return res.json({ status: true, message: 'updated password' });
    } catch (error) {
        return res.json('invalid token');
    }
})

const verifyUser = async (req, res, next) => {

    try {
        const token = req.cookies.token;

        if (!token) {
            return res.json({ status: false, message: "no token" })
        }
        const decoded = jwt.verify(token, process.env.KEY);
        next();
    } catch (error) {
        return res.json(error);
    }
}

router.get('/verify', verifyUser, (req, res) => {
    return res.json({ status: true, message: 'authorized' });
})

router.get("/logout", (req, res) => {
    res.clearCookie('token');
    return res.json({ status: true })
})

export { router as UserRouter };