# Campus Navigation Mobile App using Computer Vision

## Project Overview

This project aims to develop a mobile application that helps users identify their current location within a university campus using image-based recognition. The system uses a trained convolutional neural network (CNN) to classify images of campus buildings and return the predicted location to the user.

The application is designed for new students, visitors, and anyone unfamiliar with the campus layout. It focuses on simplicity: the user takes a photo, and the app predicts which building they are in.

---

## Motivation

Navigating a university campus can be difficult, especially when buildings are interconnected or visually similar. Traditional navigation methods such as maps or GPS are often unreliable indoors.

This project addresses this problem by leveraging computer vision to recognize buildings directly from images, providing a more intuitive and user-friendly navigation method.

---

## Objective

- Train a machine learning model to classify campus buildings based on images.
- Integrate the trained model into an iOS mobile application.
- Enable real-time, on-device inference using the phone camera.
- Provide users with accurate location predictions based on captured images.

---

## System Architecture

### High-Level Workflow

1. User opens the mobile app
2. User captures an image using the camera
3. Image is passed to the trained model
4. Model predicts the building class
5. App displays the predicted location

---

## Technologies Used

### Mobile Development

- Swift
- SwiftUI
- Core ML

### Machine Learning

- TensorFlow
- Keras

---

## Dataset

### Data Collection

- Images are manually collected using an iPhone camera
- Dataset includes multiple buildings on campus (approximately 6 classes)
- Each building has multiple images captured under different conditions

### Variations Included

- Different angles and perspectives
- Lighting conditions (daytime, evening)
- Presence of people (to improve generalization)
- Partial occlusions

### Dataset Structure

- Building 3
- Building 4
- ...

---

## Model Details

### Approach

- Use transfer learning with a pretrained CNN
- Fine-tune the model on the custom campus dataset

---

## Expected Outcomes

- Functional iOS application capable of predicting user location
- Trained CNN model optimized for mobile inference
- Dataset of labeled campus images
- Evaluation of model accuracy and performance

---

## Summary

This project demonstrates the application of computer vision and mobile machine learning for real-world navigation. It combines modern frameworks and efficient deployment techniques to deliver a practical and user-friendly solution.
