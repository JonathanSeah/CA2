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
        cb(null, 'studentPic/images'); // Directory to save uploaded files
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
    database: 'c237_studentlistapp'
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

app.use('/studentPic',express.static('studentPic/images')); // Serve static files from the 'public' directory

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: false }));
 
//Routes to render the pages
app.get('/', (req, res) => {
    const sql ='SELECT * FROM student';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving students');
            
        }
    res.render('index', { student: results });
    });
});

app.get('/student/:id', (req, res) => {
    //Extract student ID from the request parameters
    const studentId = req.params.id;
    const sql = 'SELECT* FROM student WHERE studentId = ?';
    // Fetch data from MySQL based on the student ID
    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving students by ID');
        }
        if (results.length > 0) {
        // Render the student details page with the fetched data
        res.render('student', { student: results[0] });
        }
        else {
            // If no student with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('Student not found');
        }
    });
});

app.get('/addStudent', (req, res) => {
    res.render('addStudent');
});

app.post('/addStudent', upload.single('image'),(req, res) => {
    // extract  data from the request body
    const {name, dob, contact} = req.body;
    let image;
    if (req.file) {
        image = req.file.filename; // Get the uploaded file name
    } else {
        image = 'null'; 
    }
    const sql = 'INSERT INTO student (Name, dob, contact, image) VALUES (?, ?, ?, ?)';
    // Insert the new student into the database
    connection.query(sql, [name, dob, contact, image], (error, results) => {
        if (error) {
            console.error('Error adding student:', error);
            res.status(500).send('Error adding student');
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