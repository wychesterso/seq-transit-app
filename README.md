# SEQ Transit – Mobile App

A React Native (Expo) mobile application providing real-time public transport information for South East Queensland.

Built as a companion client to the [SEQ Transit Backend Server](https://github.com/wychesterso/seq-transit-server).

---

## Overview

<img width="820" height="180" alt="D3" src="https://github.com/user-attachments/assets/0c85eb8a-bc5b-422b-b161-9264e19f8624" />

Within the SEQ Transit pipeline, `seq-transit-app` provides a user interface for displaying:

- Nearby Services
- Nearby Stops
- Service Search
- Service Details View

All data is sourced from the SEQ Transit backend, which consumes publicly available Translink feeds.

---

## Screens

### Nearby Services
Displays services with stops near the user’s current location, and upcoming arrivals for each.

### Nearby Stops
Displays nearby stop locations and upcoming arrivals.

### Search
Search for services by route number.

### Service Details
Displays:
- Route map
- Stop list
- Next 3 real-time arrival predictions per stop

---

## Tech Stack

- React Native
- Expo
- TypeScript

---

## Build

### Android APK
```bash
eas login
eas build --platform android --clear-cache
```

### Local Development

```bash
npm install
npx expo start
```

---

## Screenshots

### Nearby Services
<img width="180" height="390" alt="P1" src="https://github.com/user-attachments/assets/aa5ce7dd-802f-4d0d-8c5f-71b0618490e0" />

### Nearby Stops
<img width="180" height="390" alt="P2" src="https://github.com/user-attachments/assets/91667763-ac28-4c17-bf1c-9801168e4a7a" />

### Search
<img width="180" height="390" alt="P3" src="https://github.com/user-attachments/assets/a35b24c0-5b5a-4571-b68a-535654687787" />

### Service Details
<img width="180" height="390" alt="P4" src="https://github.com/user-attachments/assets/8cc92aed-00ee-4913-a342-bba95fc3fcee" />

