/*
 Simple SD Audio bare minimum example, plays file EXAMPLE.AFM from root folder of SD card.
 
 This example shows how to use the SimpleSDAudio library for audio playback.
 You need: 
 - An Arduino with ATmega368 or better
 - An SD-Card connected to Arduinos SPI port (many shields will do)
   -> copy EXAMPLE.AFM on freshly formated SD card into root folder
 - A passive loudspeaker and resistor or better: active speakers (then stereo output will be possible)
 
 Audio signal output is at the following pin:
 - Arduino with ATmega328       (many non-mega Arduinos): Pin 9
 - Arduino with ATmega1280/2560 (many mega Arduinos)    : Pin 44
 
 Using passive speaker:	
    Audio-Pin --- -[100 Ohm resistor]- ---- Speaker ---- GND
    
 Using amplifier / active speaker / line-in etc.:
    Audio-Pin --||--------------[10k resistor]----+----[1k resistor]---- GND
              100nF capacitor                   to amp
 
 See SimpleSDAudio.h or our website for more information:
 http://www.hackerspace-ffm.de/wiki/index.php?title=SimpleSDAudio
 
 created  20 Jan 2013 by Lutz Lisseck
 */
#include <SimpleSDAudio.h>

const int num_files = 15;
int currentFilePlaying = 1;

void setup() {
  // Open serial communications and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ;  // wait for serial port to connect. Needed for Leonardo only
  }

  // Using F("...") to avoid wasting RAM
  Serial.print(F("\nInitializing SD card..."));

  // If your SD card CS-Pin is not at Pin 4, enable and adapt the following line:
  // SdPlay.setSDCSPin(10);

  if (!SdPlay.init(SSDA_MODE_FULLRATE | SSDA_MODE_MONO | SSDA_MODE_AUTOWORKER)) {
    Serial.println(F("initialization failed. Things to check:"));
    Serial.println(F("* is a card is inserted?"));
    Serial.println(F("* Is your wiring correct?"));
    Serial.println(F("* maybe you need to change the chipSelect pin to match your shield or module?"));
    Serial.print(F("Error code: "));
    Serial.println(SdPlay.getLastError());
    while (1)
      ;
  } else {
    Serial.println(F(" Wiring is correct and a card is present."));
  }

  Serial.print(F("Reading File 1.AFM... "));
  if (!SdPlay.setFile("1.AFM")) {
    Serial.print(F("1.AFM is not found on card! Error code: "));
    Serial.print(SdPlay.getLastError());
    while (1)
      ;
  } else {
  }

  Serial.println(F("Playing"));
  SdPlay.play();
  while (!SdPlay.isStopped()) {
    delay(30000);
    Serial.println(F("Play is still playing."));
  }
  Serial.println(F("Play is done. Reading next file"));
}


void loop(void) {
  if (!SdPlay.isPlaying()) {
    // Sound file has finished playing
    currentFilePlaying = (currentFilePlaying + 1) % num_files;  // Increment file index

    String extension = ".AFM";

    String nextFileToPlay = currentFilePlaying + extension;

    Serial.print("Reading File " + nextFileToPlay + "... ");
    if (!SdPlay.setFile(nextFileToPlay.c_str())) {
      Serial.println(nextFileToPlay + " is not found on card!");
      String newNextFileToPlay = currentFilePlaying + extension;
      while (!setNextFile()) {
        Serial.println(newNextFileToPlay + " is not found on card! Reading next file...");
        ;
      }
    } else {
    }

    Serial.println(F(" Playing"));
    SdPlay.play();
    while (!SdPlay.isStopped()) {
      delay(10000);
      Serial.println(F("Play is still playing."));
    }
    Serial.println(F("Play is done. Reading next file"));
  }
}

bool setNextFile(void) {
  currentFilePlaying = (currentFilePlaying + 1) % num_files;  // Increment file index

  String extension = ".AFM";

  String nextFileToPlay = currentFilePlaying + extension;

  Serial.println("Reading File " + nextFileToPlay + "... ");
  return SdPlay.setFile(nextFileToPlay.c_str());
}