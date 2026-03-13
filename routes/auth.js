var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
let {
    RegisterValidator,
    changePasswordValidator,
    handleResultValidator
} = require('../utils/validatorHandler')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let { getPrivateKey } = require('../utils/jwtKeyProvider')
let {checkLogin} = require('../utils/authHandler')
let privateKey = getPrivateKey()
/* GET home page. */
router.post('/register', RegisterValidator, handleResultValidator, async function (req, res, next) {
    let newUser = userController.CreateAnUser(
        req.body.username,
        req.body.password,
        req.body.email,
        "69aa8360450df994c1ce6c4c"
    );
    await newUser.save()
    res.send({
        message: "dang ki thanh cong"
    })
});
router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let getUser = await userController.FindByUsername(username);
    if (!getUser) {
        res.status(403).send("tai khoan khong ton tai")
    } else {
        if (getUser.lockTime && getUser.lockTime > Date.now()) {
            res.status(403).send("tai khoan dang bi ban");
            return;
        }
        if (bcrypt.compareSync(password, getUser.password)) {
            await userController.SuccessLogin(getUser);
            let token = jwt.sign({
                id: getUser._id
            }, privateKey, {
                algorithm: 'RS256',
                expiresIn:'30d'
            })
            res.send(token)
        } else {
            await userController.FailLogin(getUser);
            res.status(403).send("thong tin dang nhap khong dung")
        }
    }

});
router.get('/me',checkLogin,function(req,res,next){
    res.send(req.user)
})

router.post('/change-password', checkLogin, changePasswordValidator, handleResultValidator, async function (req, res, next) {
    try {
        let { oldpassword, newpassword } = req.body;

        if (!bcrypt.compareSync(oldpassword, req.user.password)) {
            return res.status(403).send({ message: 'oldpassword khong dung' });
        }

        req.user.password = newpassword;
        await req.user.save();

        res.send({ message: 'doi mat khau thanh cong' });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
})


module.exports = router;
