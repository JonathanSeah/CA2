// Test :D


// Import required modules
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');  // set up multer for file uploads
// Create an Express application
const app = express();

//set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'UsersPic/images'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null,file.originalname); // Use the original file name
    }
});

const upload = multer({ storage: storage });


//Created mysql connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Republic_C207',
    database: 'c237_ca2_fitness_tracker'
  });
 
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

app.use('/UsersPic',express.static('UsersPic/images')); // Serve static files from the 'public' directory

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: false }));
 
app.get('/', (req, res) => {
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
    const name = req.params.id;
    const sql = 'SELECT* FROM user WHERE name = ?';
    // Fetch data from MySQL based on the name
    connection.query(sql, [name], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving name by ID');
        }
        if (results.length > 0) {
        // Render the student details page with the fetched data
        res.render('name', { name: results[0] });
        }
        else {
            // If no name with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('name not found');
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
    const {name, phone_number, email_address,nric,age,gender} = req.body;
    let userPic;
    if (req.file) {
        userPic = req.file.filename; // Get the uploaded file name
    } else {
        userPic = 'null'; 
    }
    const sql = 'INSERT INTO user (name, phone_number, email_address, nric, age, gender, userPic) VALUES (?, ?, ?, ?,?, ?, ?)';
    // Insert the new user into the database
    connection.query(sql, [name, phone_number, email_address, nric, age, gender, userPic ], (error, results) => {
        if (error) {
            console.error('Error adding user:', error);
            res.status(500).send('Error adding user');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/addExercise', (req, res) => {
    res.render('addExercise');
});

app.post('/addExercise',(req, res) => {
    // extract  data from the request body
    const {exercise_name, types, reps, sets} = req.body;
    
    const sql = 'INSERT INTO exercise_tracker (exercise_name, types, reps, sets) VALUES (?, ?, ?, ?)';
    // Insert the new exercise into the database
    connection.query(sql, [exercise_name, types, reps, sets ], (error, results) => {
        if (error) {
            console.error('Error adding Exercise:', error);
            res.status(500).send('Error adding Exercise');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/addFood', (req, res) => {
    res.render('addFood');
});

app.post('/addFood', upload.single('image'),(req, res) => {
    // extract  data from the request body
    const {food_name, carbs, protein, calories, fats} = req.body;
    
    const sql = 'INSERT INTO food_tracker (food_name,carbs, protein, calories, fats, Pic_food) VALUES (?, ?, ?, ?,?, ?)';
    // Insert the new food into the database
    connection.query(sql, [food_name, carbs, protein, calories, fats, Pic_food ], (error, results) => {
        if (error) {
            console.error('Error adding Food:', error);
            res.status(500).send('Error adding Food');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/updateStudent/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'SELECT * FROM student WHERE studentId = ?';
    // Fetch data from MYSQL based on the student ID
    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving student by ID');
        }
        if (results.length > 0) {
            // Render the edit student page with the fetched data
            res.render('updateStudent', { student: results[0] });
        } else {
            // If no student with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('Student not found');
        }
    });
});

app.post('/updateStudent/:id', upload.single('image'),(req, res) => {
    const studentId = req.params.id;
    // Extract updated product data from the request body
    const { name, dob, contact } = req.body;
    let image = req.body.currentImage; // retrieve current image filename
    if (req.file) {
        image = req.file.filename; // Get the uploaded file name if a new file is uploaded
    }
    const sql = 'UPDATE student SET name = ?, dob = ?, contact = ?,image =? WHERE studentId = ?';

    // Insert the new product into the database
    connection.query(sql, [name, dob, contact, image, studentId], (error, results ) => {
        if (error) {
            // Handle any errors that occur during the database operation
            console.error('Error updating student:', error);
            res.status(500).send('Error updating student');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/deleteStudent/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'DELETE FROM student WHERE studentId = ?';
    
    // Delete the product from the database
    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error('Error deleting student:', error);
            res.status(500).send('Error deleting student');
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