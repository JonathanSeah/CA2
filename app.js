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
    host: 'c237-e65p.mysql.database.azure.com',
    port: 3306,
    user: 'c237user',
    password: 'c2372025!',
    database: 'c237_24009380'
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
    let image;
    if (req.file) {
        image = req.file.filename; // Get the uploaded file name
    } else {
        image = 'null'; 
    }

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

app.get('/updateExercise/:id', (req, res) => {
    const exerciseID = req.params.id;
    const sql = 'SELECT * FROM exercise_tracker WHERE exerciseID = ?';
    // Fetch data from MYSQL based on the name
    connection.query(sql, [exerciseID], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving exercise by ID');
        }
        if (results.length > 0) {
            // Render the edit exercise_tracker page with the fetched data
            res.render('updateExercise', { exercise_tracker: results[0] });
        } else {
            // If no Exercise_name with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('ExerciseID not found');
        }
    });
});

app.get('/updateFood/:id', (req, res) => {
    const foodID = req.params.id;
    const sql = 'SELECT * FROM food_tracker WHERE foodID = ?';
    // Fetch data from MYSQL based on the name
    connection.query(sql, [foodID], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving food_name by ID');
        }
        if (results.length > 0) {
            // Render the edit exercise_tracker page with the fetched data
            res.render('updateFood', { food_tracker: results[0] });
        } else {
            // If no food_name with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('FoodID not found');
        }
    });
});

app.post('/updateUser/:id', upload.single('image'),(req, res) => {
    const userID = req.params.id;
    // Extract updated product data from the request body
    const { name, phone_number, email_address, nric , age, gender } = req.body;
    let image = req.body.currentImage; // retrieve current image filename
    if (req.file) {
        image = req.file.filename; // Get the uploaded file name if a new file is uploaded
    }
    const sql = 'UPDATE user SET name = ?, phone_number = ?, email_address = ?, nric = ?, age = ?, gender = ?, image =? WHERE userID = ?';

    // Insert the new product into the database
    connection.query(sql, [name, phone_number, email_address, nric, age, gender, image, userID ], (error, results ) => {
        if (error) {
            // Handle any errors that occur during the database operation
            console.error('Error updating user:', error);
            res.status(500).send('Error updating user');
        } else {
            res.redirect('/');
        }
    });
});

app.post('/updateExercise/:id', (req, res) => {
    const exerciseID = req.params.id;
    // Extract updated product data from the request body
    const { exercise_name, types, reps, sets } = req.body;

    const sql = 'UPDATE exercise_tracker SET exercise_name = ?, types = ?, reps = ?, sets = ? WHERE exerciseID = ?';

    // Insert the new product into the database
    connection.query(sql, [exercise_name, types, reps, sets, exerciseID ], (error, results ) => {
        if (error) {
            // Handle any errors that occur during the database operation
            console.error('Error updating exercise_tracker:', error);
            res.status(500).send('Error updating exercise_tracker');
        } else {
            res.redirect('/');
        }
    });
});

app.post('/updateFood/:id',upload.single('image'), (req, res) => {
    const foodID = req.params.id;
    // Extract updated product data from the request body
    const { food_name, carbs, protein, calories, fats} = req.body;
    let image = req.body.currentImage; // retrieve current image filename
    if (req.file) {
        image = req.file.filename; // Get the uploaded file name if a new file is uploaded
    }
    const sql = 'UPDATE food_tracker SET food_name = ?, carbs = ?, protein = ?, calories = ?, fats =?, image WHERE foodID = ?';

    // Insert the new product into the database
    connection.query(sql, [food_name, carbs, protein, calories, fats, foodID ], (error, results ) => {
        if (error) {
            // Handle any errors that occur during the database operation
            console.error('Error updating food_tracker:', error);
            res.status(500).send('Error updating food_tracker');
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