# Geolocation Gallery App

## Overview

This React Native mobile application is a feature-rich gallery that allows users to capture, store, and view images with geolocation tracking. The app integrates device camera, image picker, map view, and SQLite database to provide a comprehensive image management experience.

## Features

-  **Image Capture and Selection**
  - Take photos directly from the app
  - Select images from device gallery
  - Automatic location tagging for each image

-  **Interactive Map View**
  - Display images on a map based on their capture location
  - Visual markers showing image locations
  - Zoom and pan map functionality

-  **Local Storage with SQLite**
  - Persistent image storage
  - Metadata tracking (timestamp, location)
  - CRUD operations for image management

-  **Flexible Gallery Interface**
  - Grid view of thumbnails
  - Full-screen image view
  - Image information display (location, timestamp)

## Prerequisites

- Node.js
- React Native CLI
- Expo CLI
- Android Studio or Xcode
- Smartphone or Emulator with location services

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ComfortN/galleryApp.git
   cd galleryApp
   ```

2. Install dependencies:
   ```bash
   npm install

   ```

3. Install Expo dependencies:
   ```bash
   expo install expo-image-picker expo-location expo-sqlite
   ```

4. Run the application:
   ```bash
   expo start
   ```


## Key Technologies

- React Native
- Expo
- TypeScript
- SQLite (expo-sqlite)
- React Native Maps
- Expo Image Picker
- Expo Location

## Permissions

The app requires the following permissions:
- Camera access
- Photo library access
- Location services
