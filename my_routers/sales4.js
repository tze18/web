const router = require('express').Router();
const mysql = require('mysql');
const moment = require('moment-timezone');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'DB02'
});
db.connect();


router.use((req, res, next)=>{
    if(! req.session.loginUser){
        res.status(403);
        res.redirect('login');
    } else {
        next();
    }
});

router.get('/', (req,res)=>{
    db.query("SELECT * FROM `sales` ORDER BY sid DESC", (error, results, fields)=>{
        results.forEach(function(el){
            el.birth = moment(el.birthday).format('YYYY-MM-DD');
        });
        res.render('sales3', {
            sales: results
        });
    });
});
router.get('/add', (req,res)=>{
    res.send('sales4-add');
});
router.get("/cart", (req, res) => {
    const data = res.locals.renderData;
    res.render("cart",data);
  });
module.exports = router;

