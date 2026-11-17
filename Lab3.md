### EASTERN INTERNATIONAL UNIVERSITY 

**SCHOOL OF COMPUTING AND INFORMATION TECHNOLOGY** 

**Practice Assignment – Quarter 1, 2026-2027 Course Name: Advanced Mobile Programming Course Code:** CSW 434 **Student’s Full Name: Student ID:** 



<!-- Start of picture text -->
Practice Assignment 3<br><!-- End of picture text -->

# **PRACTICAL EXERCISE: USING SENSORS IN REACT NATIVE WITH TURBO MODULES** 

## **Objectives** 

- Understand how to use **Turbo Native Modules** to access hardware on Android. 

- Practice programming with **NFC (Near Field Communication)** and **Compass (Magnetometer)** in React Native. 

- Build an intuitive interface to display sensor data. 



<!-- Start of picture text -->
> Compass<br>W-8 9 260° #-F<br><!-- End of picture text -->

Screen 1 

## **Exercise 1: Using NFC to Read Data from an NFC Tag** 

## **Requirements:** 

Develop a React Native application that can read data from an NFC tag using **Turbo Native Module** on Android. When the user places an NFC tag near the phone, the tag’s information should be displayed on the screen. 

**Implementation Steps:** 

1. **Create a Turbo Native Module to access NFC on Android.** 

2. **Register an NFC event listener when the app starts.** 

3. **Display the retrieved NFC data on the screen.** 

## **Outcome:** 

- When the user taps an NFC tag on the phone, the tag’s information should appear on the screen. 

- The application should use **Turbo Native Module** instead of thirdparty libraries like `react-native-nfc-manager` . 

## **Exercise 2: Using a Compass to Determine Direction (Screen 1)** 

## **Requirements:** 

Develop a React Native application that uses the **Magnetometer sensor** to determine the device’s orientation relative to the North direction. The app should display a **compass interface where the needle rotates based on the device’s direction** . **Implementation Steps:** 

1. **Create a Turbo Native Module to read data from the magnetometer sensor.** 

2. **Calculate the direction angle based on sensor data.** 

3. **Display a compass interface with a rotating needle.** 

## **Outcome:** 

- As the user rotates their phone, the compass needle should dynamically adjust to point North. 

- The application should use **Turbo Native Module** instead of thirdparty libraries like `expo-sensors` . 

## **Summary** 

- This practical exercise helps students understand how to use **Turbo Native Modules** to access hardware in React Native. 

- **Task 1** teaches students how to work with **NFC** to read data from tags. 

- **Task 2** teaches students how to use the **Magnetometer sensor** to build a dynamic compass. 

- Both tasks focus on **performance and native optimization** , without relying on third-party libraries. 

**By the end of this exercise, students will be able to build applications that leverage native sensors on Android efficiently!** 

