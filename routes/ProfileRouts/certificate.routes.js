// Import necessary modules
const express = require('express');
const router = express.Router();
const multer = require('multer'); // Multer for file handling
const db = require('../../models'); // Import the database models
const Certificate = db.certificate; // Access the certificate model
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage });

// Your existing Firebase configuration and imports
const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

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

router.post("/", upload.single("image"), async (req, res) => {
    const { name, organization, issueDate, expirationDate, userId } = req.body;
    const file = req.file; // The uploaded file

    if (!name || !organization || !userId || !file) {
        return res.status(400).json({ message: "Name, organization, userId, and image are required." });
    }

    try {
        // Generate a unique file name
        const fileName = `${uuidv4()}-${file.originalname}`;
        const storageRef = ref(storageFirebase, `certificates/${fileName}`);

        // Upload the image to Firebase Storage
        const metadata = {
            contentType: file.mimetype,
        };
        const snapshot = await uploadBytes(storageRef, file.buffer, metadata);

        // Get the download URL for the uploaded image
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Save the certificate details in your database
        const certificate = await Certificate.create({
            name,
            organization,
            issueDate,
            expirationDate,
            image: downloadURL, // Save the Firebase image URL in the database
            userId,
        });

        res.status(201).json(certificate);
    } catch (error) {
        res.status(500).json({ message: "Error creating certificate", error: error.message });
    }
});
// Get all Certificates
router.get('/', async (req, res) => {
    try {
        const certificates = await Certificate.findAll();
        res.status(200).json(certificates);
    } catch (error) {
        res.status(500).json({ message: "Error fetching certificates", error: error.message });
    }
});

// Get Certificates by User ID
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const certificates = await Certificate.findAll({
            where: {
                userId: userId,
            },
        });

        if (!certificates || certificates.length === 0) {
            // Respond with 200 status and a message instead of 404
            return res.status(200).json({ message: "There is no certificate for this user." });
        }

        res.status(200).json(certificates);
    } catch (error) {
        res.status(500).json({ message: "Error fetching certificates", error: error.message });
    }
});

// Update a Certificate by ID
router.put("/:id", upload.single("image"), async (req, res) => {
    try {
      const { name, organization, issueDate, expirationDate } = req.body;
      const file = req.file; // The uploaded file, if provided
      const certificate = await Certificate.findByPk(req.params.id);
  
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
  
      let updatedImageURL = certificate.image; // Use existing image URL if no new image is uploaded
  
      // If a new image is provided, upload it to Firebase
      if (file) {
        // Generate a unique file name
        const fileName = `${uuidv4()}-${file.originalname}`;
        const storageRef = ref(storageFirebase, `certificates/${fileName}`);
  
        // Upload the image to Firebase Storage
        const metadata = {
          contentType: file.mimetype,
        };
        const snapshot = await uploadBytes(storageRef, file.buffer, metadata);
  
        // Get the download URL for the uploaded image
        updatedImageURL = await getDownloadURL(snapshot.ref);
      }
  
      // Update the certificate details in the database
      await certificate.update({
        name,
        organization,
        issueDate,
        expirationDate,
        image: updatedImageURL, // Update with the new image URL if a new image was uploaded
      });
  
      res.status(200).json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Error updating certificate", error: error.message });
    }
  });

// Delete a Certificate by ID
router.delete('/:id', async (req, res) => {
    try {
        const certificate = await Certificate.findByPk(req.params.id);

        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        await certificate.destroy();
        res.status(200).json({ message: "Certificate deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting certificate", error: error.message });
    }
});

// Get Certificates by User ID
// r

module.exports = router;
