// Test :D


// Import required modules
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session'); // set up session management
const multer = require('multer');  // set up multer for file uploads
const flash = require('connect-flash');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Create an Express application
const app = express();

//set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage: storage });


//Created mysql connection
const connection = mysql.createConnection({
    host: 'c237-e65p.mysql.database.azure.com',
    port: 3306,
    user: 'c237user',
    password: 'c2372025!',
    database: 'c237_24009380'
  });
const pool = connection.promise(); 
// Connect to the MySQL database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});
 
// Set EJS as the view engine
app.set('view engine', 'ejs');

//******** TODO: Create a Middleware to check if user is logged in. ********//
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You must be logged in to view this resource.');
        res.redirect('/login');
    }
};

app.use('/Pic',express.static('Pic/images')); // Serve static files from the 'public' directory

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory

// Middleware for session management
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // Set to true if using HTTPS
}));

app.use(flash()); // Use flash messages for notifications   

// TO DO:Create a middleware function validate user authentication
const validateRegistration = (req, res, next) => {
    const { username, password, phone_number, email_address, nric,age, gender } = req.body;
    if (!username || !password || !phone_number || !email_address || !nric || ! age || ! gender) {
        return res.status(400).send('All fields are required');
    }

    if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 or more characters long');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    next();
};

//******** TODO: Integrate validateRegistration into the register route. ********//
app.post('/register', validateRegistration,(req, res) => {
    //******** TODO: Update register route to include role. ********//
    const { username, password, phone_number, email_address, nric, age, gender } = req.body;

    const sql = 'INSERT INTO user (username, password, phone_number, email_address, nric, age, gender) VALUES (?, SHA1(?), ?, ?, ?, ?, ?)';
    connection.query(sql, [username, password, phone_number, email_address, nric, age, gender], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
});

app.get('/register', (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] });
});

//******** TODO: Insert code for login routes to render login page below ********//
app.get('/login', (req, res) => {
    res.render('login', { 
        messages: req.flash('success'), // Retrieve success messages from session and pass them to the view
        errors: req.flash('error') // Retrieve error messages from session and pass them to the view
    });
});

//******** TODO: Insert code for login routes for form submission below ********//
app.post('/login', (req, res) => {
    const { username,email_address, password } = req.body;

    //Validate username ,email, password
    if (!username|| !email_address || !password) {
        req.flash('error', 'All fields are required.'); 
        return res.redirect('/login');
    }

    const sql = 'SELECT * FROM user WHERE username = ? AND email_address = ? AND password = SHA1(?)';
    connection.query(sql, [username,email_address, password], (err, results) => {
        if (err) {
            throw err;
        }
        if (results.length > 0) {
            // Successful Login
            req.session.user = results[0]; // Store user data in session
            req.flash('success', 'Login successful!');
            //************ TO DO: Update to redirect users to /dashboard route upon successful log in *//
            res.redirect('/dashboard');
        } else {
            // Invaild credentials
            req.flash('error', 'Invalid username, email or password.');
            return res.redirect('/login');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
    res.redirect('/'); // Redirect to login page after logout
    });
});

//******** TODO: Insert code for dashboard route to render dashboard page for users. ********//
app.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.session.user, messages: req.flash('success') });
});


app.use(flash());
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}



app.get('/', (req, res) => {
    res.render('index', {user: req.session.user, messages: req.flash('success')});
    const queries = {
        user: 'SELECT * FROM user',
        exercise_tracker: 'SELECT * FROM exercise_tracker',
        food_tracker: 'SELECT * FROM food_tracker'
    };


    // First query: get user data
    connection.query(queries.user, (err, users) => {
        if (err) return res.status(500).send('Error retrieving users');

        // Second query: get exercise data
        connection.query(queries.exercise_tracker, (err, exercises) => {
            if (err) return res.status(500).send('Error retrieving exercise tracker');

            // Third query: get food data
            connection.query(queries.food_tracker, (err, foods) => {
                if (err) return res.status(500).send('Error retrieving food tracker');

                // Render the page with all data
                res.render('index', {
                    user: users,
                    exercise_tracker: exercises,
                    food_tracker: foods
                });
            });
        });
    });
});



app.get('/user/:id', (req, res) => {
    //Extract student ID from the request parameters
    const userID = req.params.id;
    const sql = 'SELECT* FROM user WHERE userID = ?';
    // Fetch data from MySQL based on the name
    connection.query(sql, [userID], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving name by ID');
        }
        if (results.length > 0) {
        // Render the student details page with the fetched data
        res.render('userID', { user: results[0] });
        }
        else {
            // If no name with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('userID not found');
        }
    });
});

app.get('/food_name/:id', (req, res) => {
    //Extract student ID from the request parameters
    const food_name = req.params.id;
    const sql = 'SELECT* FROM food_tracker WHERE food_name = ?';
    // Fetch data from MySQL based on the name
    connection.query(sql, [food_name], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving food_name by ID');
        }
        if (results.length > 0) {
        // Render the student details page with the fetched data
        res.render('food_name', { name: results[0] });
        }
        else {
            // If no name with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('food_name not found');
        }
    });
});

app.get('/exercise_name/:id', (req, res) => {
    //Extract exercise ID from the request parameters
    const exercise_name = req.params.id;
    const sql = 'SELECT* FROM exercise_tracker WHERE exercise_name = ?';
    // Fetch data from MySQL based on the name
    connection.query(sql, [exercise_name], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving exercise_name by ID');
        }
        if (results.length > 0) {
        // Render the student details page with the fetched data
        res.render('exercise_name', { name: results[0] });
        }
        else {
            // If no name with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('exercise_name not found');
        }
    });
});

app.get('/addUser', (req, res) => {
    res.render('addUser');
});

app.post('/addUser', upload.single('image'),(req, res) => {
    // extract  data from the request body
    const {username, password, phone_number, email_address,nric,age,gender} = req.body;
    let userPic;
    if (req.file) {
        userPic = req.file.filename; // Get the uploaded file name
    } else {
        userPic = 'null'; 
    }
    const sql = 'INSERT INTO user (username, password, phone_number, email_address, nric, age, gender, userPic) VALUES (?, ?, ?, ?,?, ?, ?, ?)';
    // Insert the new user into the database
    connection.query(sql, [username, password, phone_number, email_address, nric, age, gender, userPic ], (error, results) => {
        if (error) {
            console.error('Error adding user:', error);
            res.status(500).send('Error adding user');
        } else {
            res.redirect('/');
        }
    });
});

//add exercise - Jonathan ------------------------------------//
app.get('/addExercise', isLoggedIn, (req, res) => {
  res.render('AddExercise', { message: req.flash('error') });
});

app.post(
  '/addExercise',
  isLoggedIn,
  async (req, res) => {
    const { exercise_name, types, reps, sets } = req.body;

    if (exercise_name.length > 45 || types.length > 45) {
      req.flash('error', 'Field length exceeded.');
      return res.redirect('/addExercise');
    }

    try {
      await pool.query(
        `INSERT INTO exercise_tracker (userID, exercise_name, types, reps, sets)
         VALUES (?,?,?,?,?)`,
        [req.session.user.userID, exercise_name, types, reps, sets]
      );
      req.flash('info', 'Exercise added successfully.');
      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Could not add exercise.');
      res.redirect('/addExercise');
    }
  }
);
//--------------------------------------------------------------//

//add food - Jonathan-------------------------------------------//
app.get('/addFood', isLoggedIn, (req, res) => {
  res.render('AddFood', { message: req.flash('error') });
});

app.post('/addFood', isLoggedIn, upload.single('foodImage'), async (req, res) => {
  const { food_name, carbs, protein, calories, fats } = req.body;

  if (food_name.length > 45) {
    req.flash('error', 'Food name exceeds 45 characters.');
    return res.redirect('/addFood');
  }

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    await pool.query(
      `INSERT INTO food_tracker (userID, food_name, carbs, protein, calories, fats, image)
       VALUES (?,?,?,?,?,?,?)`,
      [req.session.user.userID, food_name, carbs, protein, calories, fats, imagePath]
    );
    req.flash('info', 'Food added successfully.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not add food.');
    res.redirect('/addFood');
  }
});
//---------------------------------------------------------------//

app.get('/updateUser/:id', (req, res) => {
    const userID = req.params.id;
    const sql = 'SELECT * FROM user WHERE userID = ?';
    // Fetch data from MYSQL based on the name
    connection.query(sql, [userID], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving name by ID');
        }
        if (results.length > 0) {
            // Render the edit user page with the fetched data
            res.render('updateUser', { user: results[0] });
        } else {
            // If no user with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('UserID not found');
        }
    });
});

// update exercise -Elden-------------------------------------//

//---------------------------------------------------------------//

// update food -Elden ----------------------------------------//

//---------------------------------------------------------------//

app.post('/updateUser/:id', upload.single('image'),(req, res) => {
    const userID = req.params.id;
    // Extract updated product data from the request body
    const { username, password, phone_number, email_address, nric , age, gender } = req.body;
    let image = req.body.currentImage; // retrieve current image filename
    if (req.file) {
        image = req.file.filename; // Get the uploaded file name if a new file is uploaded
    }
    const sql = 'UPDATE user SET username = ?, password = ? , phone_number = ?, email_address = ?, nric = ?, age = ?, gender = ?, image =? WHERE userID = ?';

    // Insert the new product into the database
    connection.query(sql, [username, password, phone_number, email_address, nric, age, gender, image, userID ], (error, results ) => {
        if (error) {
            // Handle any errors that occur during the database operation
            console.error('Error updating user:', error);
            res.status(500).send('Error updating user');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/deleteUser/:id', (req, res) => {
    const userID = req.params.id;
    const sql = 'DELETE FROM user WHERE userID = ?';
    
    // Delete the product from the database
    connection.query(sql, [userID], (error, results) => {
        if (error) {
            console.error('Error deleting user:', error);
            res.status(500).send('Error deleting user');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/deleteExercise/:id', (req, res) => {
    const exerciseID = req.params.id;
    const sql = 'DELETE FROM exercise_tracker WHERE exerciseID = ?';
    
    // Delete the product from the database
    connection.query(sql, [exerciseID], (error, results) => {
        if (error) {
            console.error('Error deleting exercise:', error);
            res.status(500).send('Error deleting exercise');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/deleteFood/:id', (req, res) => {
    const foodID = req.params.id;
    const sql = 'DELETE FROM food_tracker WHERE foodID = ?';
    
    // Delete the product from the database
    connection.query(sql, [foodID], (error, results) => {
        if (error) {
            console.error('Error deleting food:', error);
            res.status(500).send('Error deleting food');
        } else {
            res.redirect('/');
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);})


// This is a comment :D