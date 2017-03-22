CC=clang++

FRAMEWORKS:= -framework Cocoa

SOURCE=src/native/main.cc src/native/node-spellchecker/spellchecker_mac.mm 

OUT=-o out/spellchecker

all:
	$(CC) $(SOURCE) $(FRAMEWORKS) $(OUT)