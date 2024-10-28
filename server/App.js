const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const linkedinRoutes = require('./routes/linkedin.config');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://mnihalap:Nihal123@igor-app-linkedin.qpgsw.mongodb.net/?retryWrites=true&w=majority&appName=Igor-App-Linkedin', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use('/api/linkedin', linkedinRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});