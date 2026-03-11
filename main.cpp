#include <iostream>
#include <string>
#include <cstdio>
#include <fstream>
#include <ctime>
#include <iomanip>
#include "json.hpp"
#include <vector>

using namespace std;
using json = nlohmann::json;

string getWeather(string city, string apiKey)
{
    string command =
    "curl -s \"https://api.openweathermap.org/data/2.5/weather?q="
    + city +
    "&appid=" + apiKey +
    "&units=metric\"";

    string result = "";
    char buffer[128];

    FILE* pipe = popen(command.c_str(), "r");

    while (fgets(buffer, sizeof(buffer), pipe) != NULL)
    {
        result += buffer;
    }

    pclose(pipe);

    return result;
}

string GetCurrentTime() {
    time_t now = time(0);
    tm *ltm = localtime(&now);
    char buffer[80];
    strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", ltm);
    return string(buffer);
}

void SaveToHistory(string city, double temp, string weather) {
    json historyData;
    ifstream historyFileIn("history.json");
    if (historyFileIn.is_open()) {
        try {
            historyData = json::parse(historyFileIn);
        } catch (...) {
            historyData = json::array();
        }
        historyFileIn.close();
    } else {
        historyData = json::array();
    }
    
    if (!historyData.is_array()) {
        historyData = json::array();
    }

    json newEntry;
    newEntry["city"] = city;
    newEntry["temp"] = temp;
    newEntry["weather"] = weather;
    newEntry["time"] = GetCurrentTime();

    historyData.insert(historyData.begin(), newEntry);
    
    if (historyData.size() > 5) {
        historyData.erase(historyData.size() - 1);
    }

    ofstream historyFileOut("history.json");
    if (historyFileOut.is_open()) {
        historyFileOut << historyData.dump(4);
        historyFileOut.close();
    }
}

void ShowHistory() {
    ifstream historyFileIn("history.json");
    if (historyFileIn.is_open()) {
        json historyData;
        try {
            historyData = json::parse(historyFileIn);
            if (!historyData.is_array() || historyData.empty()) {
                cout << "\nNo search history available.\n";
            } else {
                cout << "\n===== Search History (Last 5) =====\n";
                for (const auto& entry : historyData) {
                    string city = entry.value("city", "Unknown");
                    double temp = entry.value("temp", 0.0);
                    string weather = entry.value("weather", "Unknown");
                    string time = entry.value("time", "Unknown");
                    
                    cout << "[" << time << "] " << city << " - " 
                         << temp << " C, " << weather << endl;
                }
            }
        } catch (...) {
            cout << "\nError reading history data.\n";
        }
        historyFileIn.close();
    } else {
        cout << "\nNo search history available yet.\n";
    }
}

void GetWeather(string city, bool jsonOutput = false){
    string apiKey;
    ifstream keyFile("api_key.txt");
    if (keyFile.is_open()) {
        getline(keyFile, apiKey);
        keyFile.close();
        if (!apiKey.empty() && apiKey.back() == '\r') apiKey.pop_back();
    } else {
        cout << "Error: Could not open api_key.txt" << endl;
        return;
    }

    string response = getWeather(city, apiKey);

    if (jsonOutput) {
        cout << response << endl; // Output pure JSON for the web UI
        try {
            json data = json::parse(response);
            if (data["cod"] == 200) {
                string cityName = data.value("name", "Unknown");
                double temp = data["main"].value("temp", 0.0);
                string weather = "Unknown";
                if (data.contains("weather") && data["weather"].is_array() && !data["weather"].empty()) {
                    weather = data["weather"][0].value("main", "Unknown");
                }
                SaveToHistory(cityName, temp, weather);
            }
        } catch (...) {}
        return;
    }

    try {
    json data = json::parse(response);
    
    // Check if the API request was successful
    if (data["cod"] == 200) {
        string cityName = data["name"];
        double temp = data["main"]["temp"];
        int humidity = data["main"]["humidity"];
        string weather = data["weather"][0]["main"];
        double lon = data["coord"]["lon"];
        double lat = data["coord"]["lat"];
        
        cout << "\n===== Weather Report =====\n";
        cout << "City: " << cityName << endl;
        cout << "Lon: " << lon << "\tLat: " << lat << endl;
        cout << "Temperature: " << temp << " C" << endl;
        cout << "Humidity: " << humidity << " %" << endl;
        cout << "Condition: " << weather << endl;
        
        SaveToHistory(cityName, temp, weather);
    } else {
        // API returned an error (e.g., City not found)
        cout << "Error: " << data["message"] << endl;
    }
} catch (const exception& e) {
    cout << "Error retrieving or parsing weather data." << endl;
}

}


int main(int argc, char* argv[])
{   
    system("chcp 65001 > nul"); // Enforce UTF-8 on Windows

    if (argc > 1) {
        string arg(argv[1]);
        if (arg == "--json" && argc > 2) {
            string city = argv[2];
            for (char& c : city) {
                if (c == ' ') c = '+';
            }
            GetWeather(city, true);
            return 0;
        } else if (arg == "--history") {
            ifstream historyFileIn("history.json");
            if (historyFileIn.is_open()) {
                json historyData;
                try {
                    historyData = json::parse(historyFileIn);
                    cout << historyData.dump(4) << endl;
                } catch (...) { cout << "[]" << endl; }
            } else { cout << "[]" << endl; }
            return 0;
        }
    }

    while (true)
    {
        cout<<"1.Get Weather Report"<<endl;
        cout<<"2.View History"<<endl;
        cout<<"3.Exit"<<endl;
        int user_input;
        cout<<"Enter Your Input :";
        cin>>user_input;
        if (user_input==1)
        {
            string city;
            cout<<"\n Enter Your City Name : ";
            cin.ignore();
            getline(cin, city);
            
            // Replace spaces with '+' for the URL
            for (char& c : city) {
                if (c == ' ') {
                    c = '+';
                }
            }
            GetWeather(city);
        }
        else if (user_input==2)
        {
            ShowHistory();
        }
        else if (user_input==3)
        {
            break;
        }
        else{
            cout<<"Wrong Entry Please Try Again \n";
        }
        
        

    }
    

    return 0;
}