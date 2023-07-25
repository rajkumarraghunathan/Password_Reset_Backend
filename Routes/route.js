const customer = require('../Schema/customer')
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();


router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;

        //Email verify
        const existingUser = await customer.findOne({ email: email });
        if (!existingUser) {
            return res.send({ message: "Wrong User,User not found" })
        }

        res.status(200).send({
            message: 'User signed-in successfully.',
            data: existingUser,

        })
    }
    catch (error) {
        res.status(500).send({ message: 'Internal Error', error: error })
    }
})


// --------------------------------------------------------------------------------------------------------------------------------------------------------


// --------------------------------------------------------------------------------------------------------------------------------------------------------

router.post('/Signup', async (req, res) => {
    try {
        const { email } = req.body;


        const existingUser = await customer.findOne({ email: email });

        if (existingUser) {
            return res.status(400).send({ message: "User Already Exists" })
        }
        // const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new customer({ email: email })

        await newUser.save().then((data) => {
            res.status(200).send({
                message: "New user was added Sucessfully................",
                data: data
            })
        }).catch((err) => {
            res.status(400).send({ message: 'There is a error while adding a New User' })
        })
    } catch (error) {
        res.status(500).send({ message: "Internal Error", error: error })
    }

})


// --------------------------------------------------------------------------------------------------------------------------------------------------------

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await customer.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
        await user.save();

        // Send password reset email
        const transporter = nodemailer.createTransport({
            // Configure your email provider settings
            service: 'gmail',
            auth: {
                user: process.env.user,
                pass: process.env.pass
            }
        });

        const mailOptions = {
            from: process.env.user,
            to: user.email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password:${process.env.API_URL}/Reset-password/${resetToken}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return false;
            } else {
                console.log('Email sent:', info.response);
                return true;
            }
        });

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --------------------------------------------------------------------------------------------------------------------------------------------------------

router.post('/Reset-password/:resetToken', async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await customer.findOne({
            resetToken: resetToken,
            resetTokenExpiration: { $gt: Date.now() }

        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.hashPassword = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --------------------------------------------------------------------------------------------------------------------------------------------------------

router.get('/logout', async (req, res) => {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('role');
        res.status(200).send({ message: 'User signed-out!', redirectUrl: "/LoginPage" });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

// --------------------------------------------------------------------------------------------------------------------------------------------------------


router.delete('/deleteUser/:userId', async (req, res) => {
    const { userId } = req.params;
    await customer.findByIdAndDelete({ _id: userId }).then(user => {
        if (user) {
            return res.status(200).send({ message: 'User was deleted successfully.' });
        }
        return res.status(400).send({ message: 'No user was found' });
    }).catch(error => {
        res.status(200).send({ message: 'User was not deleted due to error.', error: error });
    })
})

// --------------------------------------------------------------------------------------------------------------------------------------------------------

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await customer.findById({ _id: userId }).then(user => {
            if (user) {
                return res.status(200).send({ message: 'User was retrived successfully.', data: user });
            }
            return res.send(400).send({ message: "No user Found" })
        }).catch(error => {
            res.status(400).send({ message: 'Error while retrieving user.' })
        });
    } catch (error) {
        res.status(200).send({ message: 'Internal Server Error', error: error });
    }

})


module.exports = router;
