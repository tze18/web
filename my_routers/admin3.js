const router = require('express').Router();

router.route('/member/edit/:id')
    .all((req, res, next)=>{
        res.locals.memberData = {name:'bill', id:'B007'};
        next();
    })
    .get((req, res)=>{
        const obj = {
            baseUrl: req.baseUrl,
            url: req.url,
            data: res.locals.memberData
        };
        res.send('edit get: '+ JSON.stringify(obj));
    })
    .post((req, res)=>{
        res.send('edit post: '+ JSON.stringify(res.locals.memberData));
    });

module.exports = router;