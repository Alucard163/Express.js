const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const csrf = require('csurf')
const flash = require('connect-flash')
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const errorHandler = require('./middleware/error')
const fileMiddleware = require('./middleware/file')
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const ordersRoutes = require('./routes/orders')
const coursesRoutes = require('./routes/courses')
const profileRoutes = require('./routes/profile')
const cardRoutes = require('./routes/card')
const authRoutes = require('./routes/auth')
const helmet = require('helmet')
const compression = require('compression')
const User = require('./models/user');
const keys = require('./keys')

const app = express();


const hbs = exphbs.create({
	defaultLayout: 'main',
	extname: 'hbs',
  helpers: require('./utils/hbs-helpers'),
	runtimeOptions: {
		allowProtoPropertiesByDefault: true,
		allowProtoMethodsByDefault: true,
	},
    handlebars: allowInsecurePrototypeAccess(Handlebars),
});

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI,
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(async (req, res, next) => {
    try {
        const user = await User.findById('5cc1d')
        req.uset = user
        next()
    } catch (err) {
        console.error(err)
    }
    next()
})

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}))
app.use(csrf(session))
app.use(flash())
app.use(varMiddleware)
app.use(userMiddleware)
app.use(fileMiddleware.single('avatar'))
app.use(helmet())
app.use(compression())
app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/card', cardRoutes)
app.use('/profile', profileRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        const url = keys.MONGODB_URI
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

start();
