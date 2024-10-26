// postRequirement.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../../models'); // Adjust the path to your db.js file
const PostRequirement = db.postRequirement;

// Import Firebase Storage functions
const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storageFirebase = getStorage(app);

// Setup multer to handle file uploads
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage });

// Create a new PostRequirement with file upload
router.post('/', upload.single('file'), async (req, res) => {
  const {
    location,
    phoneNumber,
    lookingFor,
    skills,
    requirementDescription,
    meetingPreference,
    budget,
    currency,
    preferredGender,
    language,
    userId,
  } = req.body;

  // Check if essential fields are present
  if (!location || !phoneNumber || !userId) {
    return res.status(400).json({ message: "Location, Phone Number, and User ID are required." });
  }

  try {
    let fileURL = null;

    // Handle file upload to Firebase if a file is provided
    if (req.file) {
      const fileRef = ref(storageFirebase, `uploads/${uuidv4()}_${req.file.originalname}`);
      await uploadBytes(fileRef, req.file.buffer);
      fileURL = await getDownloadURL(fileRef);
    }

    const postRequirement = await PostRequirement.create({
      location,
      phoneNumber,
      lookingFor,
      skills,
      requirementDescription,
      meetingPreference,
      budget,
      currency,
      preferredGender,
      language,
      file: fileURL, // Store the download URL
      userId,
    });

    res.status(201).json(postRequirement);
  } catch (error) {
    console.error('Error creating PostRequirement:', error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get all PostRequirements
router.get('/', async (req, res) => {
  try {
    const postRequirements = await PostRequirement.findAll();
    res.status(200).json(postRequirements);
  } catch (error) {
    console.error('Error fetching PostRequirements:', error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get PostRequirements by User ID
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const postRequirements = await PostRequirement.findAll({
      where: { userId } // Filter by userId
    });

    if (postRequirements.length === 0) {
      return res.status(404).json({ message: 'No PostRequirements found for this User ID.' });
    }

    res.status(200).json(postRequirements);
  } catch (error) {
    console.error('Error fetching PostRequirements by User ID:', error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get a PostRequirement by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const postRequirement = await PostRequirement.findByPk(id);
    if (!postRequirement) {
      return res.status(404).json({ message: 'PostRequirement not found.' });
    }
    res.status(200).json(postRequirement);
  } catch (error) {
    console.error('Error fetching PostRequirement:', error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update a PostRequirement
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  const {
    location,
    phoneNumber,
    lookingFor,
    skills,
    requirementDescription,
    meetingPreference,
    budget,
    currency,
    preferredGender,
    language,
    file,
    userId,
  } = req.body;

  if (!location || !phoneNumber || !userId) {
    return res.status(400).json({ message: "Location, Phone Number, and User ID are required." });
  }

  try {
    const postRequirement = await PostRequirement.findByPk(id);
    if (!postRequirement) {
      return res.status(404).json({ message: 'PostRequirement not found.' });
    }

    await postRequirement.update({
      location,
      phoneNumber,
      lookingFor,
      skills,
      requirementDescription,
      meetingPreference,
      budget,
      currency,
      preferredGender,
      language,
      file,
      userId,
    });

    res.status(200).json(postRequirement);
  } catch (error) {
    console.error('Error updating PostRequirement:', error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Delete a PostRequirement
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const postRequirement = await PostRequirement.findByPk(id);
    if (!postRequirement) {
      return res.status(404).json({ message: 'PostRequirement not found.' });
    }

    await postRequirement.destroy();
    res.status(200).json({ message: 'PostRequirement deleted successfully.' }); // Include message
  } catch (error) {
    console.error('Error deleting PostRequirement:', error);
    res.status(500).json({ message: "Internal server error." });
  }
});


module.exports = router;
