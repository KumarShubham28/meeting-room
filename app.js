const express = require('express');
const bodyParser = require('body-parser');
const booked_room = require('./models').booked_room;
const room = require('./models').room;
const moment = require('moment');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const passport = require("passport");
const jwt = require('jsonwebtoken');

const app = express();
app.use(passport.initialize());
app.use(passport.session());
require('./passport/passport')(passport);

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'ks1763417@gmail.com',
        pass: 'dxmnvuxsbitgnnno'
    }
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/signUp', passport.authenticate('local-signup'), (req, res) => {
    res.send({message: 'User created'})
})

app.post('/signIn',(req, res, next) => {
    passport.authenticate('user-signin', (err, user, info) => {
        if (err) {
          res.status(500).send(error);
        } if (!user) {
          res.status(401).send(info)
        }
        else {
          req.logIn(user, { session: false }, async (err) => {
            try {
              if (err) {
                res.status(500).send(error);
              } else {
                const token = await jwt.sign(user, 'your_jwt_secret', { expiresIn: "10h" });
                res.status(200).json({ user: req.user, token: token })
              }
            } catch (error) {
              res.status(500).send(error)
            }
          });
        }
        })(req, res, next);
})
app.post('/room', passport.authenticate('jwt', { session: false }),async (req, res) => {
    const data = {
        name: req.body.name
    }
    try {
        const create_room = await room.create(data)
        res.send(create_room)
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
});

app.get('/all_room', passport.authenticate('jwt', { session: false }), async (req, res) =>{
    try {
        const room = await room.findAll({ where: {} })
        console.log(room)
        res.send(room)
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

app.post('/booking/:id', passport.authenticate('jwt', { session: false }),async (req, res) => {
    const data = {
        startHour: req.body.startHour,
        endHour: req.body.endHour,
        purpose: req.body.purpose,
        user_email: req.body.user_email,
        room_id: req.params.id
    }
    try {
        const room_data = await room.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!room_data) {
            return res.send("room not available")
        }
        const find_booking = await booked_room.findAll({
            where: {
                room_id: req.params.id
            }
        })
        if (find_booking.length > 0) {
            find_booking.forEach(async (booking) => {
                const format = 'hh:mm:ss'
                const time = moment(req.body.startHour, format),
                    beforeTime = moment(booking.dataValues.startHour, format),
                    afterTime = moment(booking.dataValues.endHour, format);

                if (time.isBetween(beforeTime, afterTime)) {
                    return res.send({ message: `from ${beforeTime} till ${afterTime} is already booked by ${booking.dataValues.user}` })
                }
                const create_booking = await booked_room.create(data)
                res.send(create_booking)
            })
        } else {
            const create_booking = await booked_room.create(data)
            res.send(create_booking)
        }
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
});

app.get('/', passport.authenticate('jwt', { session: false }),async (req, res) => {
    try {
        const bookings = await booked_room.findAll({ where: {} })
        console.log(bookings)
        res.send(bookings)
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

app.delete('/:id',passport.authenticate('jwt', { session: false }) ,async (req, res) => {
    try {
        const bookings = await booked_room.destroy({
            where: { id: req.params.id }
        });
        if (bookings == 0) {
            return res.status(400).send("something went wrong")
        }
        res.send({ message: 'Deleted' })
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

cron.schedule('*/20 * * * * *', async () => {
    console.log("running a task in every 10 sec");
    try {
        const find_booking = await booked_room.findAll({
            where: {}
        })
        if (find_booking.length > 0) {
            find_booking.forEach(async (booking) => {
                console.log(booking)
                let mailOptions = {
                    from: 'ks1763417@gmail.com',
                    to: booking.dataValues.email,
                    subject:`reminder for your meeting at ${booking.dataValues.startHour}`,
                    text: 'Some content to send'
                };
                const format = 'hh:mm:ss'
                const startDateLocal = moment()
                const endDateLocal = moment(booking.dataValues.startHour, format)
                const difference = moment.duration(endDateLocal.diff(startDateLocal))
                const time = difference.hours() + difference.minutes() / 60
                console.log(time, 'time......')
                if(time == 1){
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
});

module.exports = app;