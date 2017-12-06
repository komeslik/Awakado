
// This #include statement was automatically added by the Particle IDE.
#include "application.h"
#undef min
#undef max
#include <vector>
#include <algorithm>

#include <Adafruit_SSD1306.h>
#include "pitches.h"

using namespace std;
// use hardware SPI
#define OLED_DC     D6
#define OLED_CS     D4
#define OLED_RESET  D5
Adafruit_SSD1306 display(OLED_DC, OLED_RESET, OLED_CS);
const int button = D3;
const int snoozeButton = D7;
const int piezo = D2;

long lastReleased = 0;
bool pressed = false;
long snoozeLastReleased = 0;
bool snoozePressed = false;

int  x, minX; // variables for scrolling code
int cycles = 5;
bool buzzing = false;
// void getBusTimes() {
//     // publish the event that will trigger our Webhook
//     Particle.publish("get_nextbus");
// }

// create a software timer to get new prediction times every minute
// Timer timer(60000, getBusTimes);
Timer alarm(cycles * 1000, startAlarm, true);
Timer buzzTimer(10, buzz, false);

int melody[] = {
  NOTE_C7, NOTE_C7, NOTE_C7, NOTE_C7,
  0, NOTE_B6, NOTE_B6, NOTE_B6,
  NOTE_B6, 0, NOTE_A6, NOTE_A6,
  NOTE_A6, 0, NOTE_E6, NOTE_E6,
  NOTE_E6, 0, NOTE_E6, 0, 
  NOTE_E6, 0, NOTE_E6, 0, 
  NOTE_E6, 0, NOTE_A6, 0,
  NOTE_A6, 0, NOTE_A6,0, 
  NOTE_A6,0, NOTE_A6, NOTE_A6,
  0, NOTE_G6, 0, NOTE_A6,
  NOTE_A6, 0, NOTE_F6,NOTE_F6,
  0,NOTE_F6, 0,NOTE_F6, 
  0, NOTE_F6, 0,NOTE_F6,
  0, NOTE_A6, 0,  NOTE_A6,
  0, NOTE_A6,0,NOTE_A6,
  0,   NOTE_A6, NOTE_A6,  0,
  NOTE_B6, 0, NOTE_C7, NOTE_C7,
  0, NOTE_G6,NOTE_G6,0,
  NOTE_G6,0,NOTE_G6,0,
  NOTE_G6,0,NOTE_G6,0,
  NOTE_C7,0,NOTE_C7,0,
  NOTE_C7,0,NOTE_C7,0,
  NOTE_C7, NOTE_C7, 0, NOTE_D7,
  0, NOTE_D7, NOTE_D7, 0,
  NOTE_B6,NOTE_B6, NOTE_B6,0
  
};

int thisNote = 0;

vector<String> todos;
int todoPtr;

void setup() {
  Time.zone(-6);
  Serial.begin(9600);
  pinMode(button, INPUT_PULLUP);
  pinMode(snoozeButton, INPUT_PULLUP);
  Particle.subscribe("addTodo", printEvent);
  Particle.subscribe("cycles", cycleCalc);
  Particle.subscribe("removeTodo", removeTodo);

  // by default, we'll generate the high voltage from the 3.3v line internally! (neat!)
  display.begin(SSD1306_SWITCHCAPVCC);

  display.setTextSize(7);       // text size
  display.setTextColor(WHITE); // text color
  display.setTextWrap(false); // turn off text wrapping so we can do scrolling
  x = display.width(); // set scrolling frame to display width
  minX = -1500; // 630 = 6 pixels/character * text size 7 * 15 characters * 2x slower
}

void loop() {

  display.clearDisplay();
  display.setCursor(x / 2, 7);
  if (isButtonPressed(snoozeButton) && millis() - snoozeLastReleased > 100 && !snoozePressed) {
    snoozePressed = true;
    Serial.println("Snooze pressed");
    if (buzzing) {
      buzzTimer.stop();
      snooze();
    }
    else if (!todos.empty()) {
      todoPtr++;
      todoPtr = todoPtr%todos.size();
      x = display.width(); // set scrolling frame to display width
    }
  }
  if (!todos.empty()) {
    minX = -1 * 6 * 7 * strlen(todos.at(todoPtr)) * 2;
    display.print(todos.at(todoPtr));
  }
  else {
    minX = -1500; // 630 = 6 pixels/character * text size 7 * 15 characters * 2x slower
    display.print("WAKE UP!!");
    display.print("AWAK-A-DO");
  }

  display.display();
  if (--x < minX) x = display.width() * 2;

  if (isButtonPressed(button) && millis() - lastReleased > 100 && !pressed) {
    pressed = true;
    Serial.println("press");
    if (buzzing) {
      buzzing = false;
      buzzTimer.stop();
      thisNote = 0;
    }
    else {
      setAlarm();
    }
  }

  if (!isButtonPressed(button)) {
    pressed = false;
    lastReleased = millis();
  }
  if (!isButtonPressed(snoozeButton)) {
    snoozePressed = false;
    snoozeLastReleased = millis();
  }

}

void printEvent(const char *event, const char *data) {
  todos.push_back(data);
  sort(todos.begin(), todos.end());
  for (vector<String>::const_iterator viter = todos.begin(); viter < todos.end(); viter++) {
    Serial.println(*viter);
  }
}


void cycleCalc(const char *event, const char *data) {
  Serial.print(data);
  cycles = atoi(data);
  Serial.println(cycles);
}

void buzz() {
  Serial.println("buzz");
  tone(piezo, melody[thisNote / 10], 10);
  ++thisNote;
  thisNote = thisNote %1000;
}

void setAlarm() {
  Serial.println("setalarm");
  setCycles();
  alarm.start();
}
void setCycles() {
  if (!todos.empty()) {
    int h, m = 0;
    string time(todos.at(0));
    time = time.substr(0, 5);
    if (sscanf(time.c_str(), "%d:%d", &h, &m) >= 2) {
      Serial.print(h);
      Serial.print(":");
      Serial.println(m);
      Serial.print(Time.hour());
      Serial.print(":");
      Serial.println(Time.minute());
      int secondsUntilFirstEvent = (h - Time.hour()) * 3600 - (m - Time.minute()) * 60;
      if (secondsUntilFirstEvent < 0) {
        secondsUntilFirstEvent += 24 * 3600;
      }
      if (secondsUntilFirstEvent < cycles * 90 * 60) {
        cycles = secondsUntilFirstEvent / (90 * 60);
      }
    }
  }

  alarm.changePeriod(cycles * 1000);
}

void startAlarm() {
  buzzing = true;
  buzzTimer.start();
}

void snooze() {
  alarm.changePeriod(1000);
  alarm.start();
}

void removeTodo(const char *event, const char *data) {
  todos.erase(remove(todos.begin(), todos.end(), data), todos.end());
  Serial.print("Removed ");
  Serial.println(data);
  for (vector<String>::const_iterator viter = todos.begin(); viter < todos.end(); viter++) {
    Serial.println(*viter);
  }
  x = display.width(); // set scrolling frame to display width

}

/**
* Return true if the door open/close button is pressed
*
* Note: this is directly based on hardware.  No debouncing or
*       other processing is performed.
*
* return  true if buttons is currently pressed, false otherwise
*/
bool isButtonPressed(int b) {
  return (!digitalRead(b) == 1);
  return false;
}