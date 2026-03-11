# 🌤️ Modern C++ Weather Application

A fully functional, beautiful Weather Application combining the raw performance of a **C++ backend** with the modern aesthetics of an **HTML/CSS/JS frontend**. The app fetches real-time data from OpenWeatherMap and provides interactive animated environments based on the weather conditions and local time of the searched city!

## ✨ Features
- **C++ Core**: Lightweight, blazing fast binary that handles HTTP requests and local history storage.
- **Python Bridge**: A tiny `server.py` local HTTP server binding the frontend to the C++ executable.
- **Glassmorphic UI**: A stunning, animated web interface with gradients, blurs, and parallax scrolling.
- **Dynamic Themes**: The background naturally changes to daylight/nighttime depending on the searched location's coordinates.
- **Animated Weather**: Rain/Cloud CSS animations trigger based on live weather data.
- **Interactive Map**: Embedded Leaflet.js map with light and dark cartography themes.
- **Search History**: Automatically tracking, storing, and loading your last 5 searches using C++ and `history.json`.

## ⚙️ Prerequisites
You need the following installed:
1. **C++ Compiler** (like `g++` via MinGW)
2. **Python 3.x**
3. **Curl** (Usually pre-installed on modern Windows/macOS/Linux)
4. An **OpenWeatherMap API Key** (Free tier works perfectly)

## 🚀 Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/Weather-App.git
   cd Weather-App
   ```

2. **Add your API Key**:
   Create a new file in the root directory named `api_key.txt`.
   Paste your OpenWeatherMap API key directly into this file (no spaces, no quotes):
   ```
   12345abcdef67890ghijklmnop
   ```

3. **Compile the C++ Backend**:
   ```bash
   g++ main.cpp -o weather_app.exe
   ```
   *(Note: if you are on Linux/macOS, compile to `./weather_app` and adjust the executable path in `server.py` accordingly).*

4. **Launch the Server**:
   ```bash
   python server.py
   ```

5. **Open the App**:
   Navigate to [http://localhost:8000](http://localhost:8000) in your web browser. Enjoy!

## 💻 CLI Usage
You don't *have* to use the web server. The exact same binary can be used straight from your terminal for high-speed weather lookups!
```bash
# Interactive Mode
./weather_app.exe

# Raw JSON Mode (For scripting)
./weather_app.exe --json "New York"
```
