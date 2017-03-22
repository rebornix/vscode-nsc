#include <iostream>
#include <stdio.h>
#include "util.h"
#include "node-spellchecker/spellchecker.h"

using namespace spellchecker;

int main(int argc, const char *argv[])
{
    std::clog << "Commands:" << std::endl;
    std::clog << "quit - Quit" << std::endl;
    std::clog << "add <word> - Add word" << std::endl;
    std::clog << "ac <word> <word> - Add autocorrect pair" << std::endl;
    std::clog << "ign <word> - Ignore word" << std::endl;
    std::clog << "chkb <text> - Check text (batch - pasted text or file open)" << std::endl;
    std::clog << "chk <text> - Check text (as you type)" << std::endl;

    SpellcheckerImplementation *impl = SpellcheckerFactory::CreateSpellchecker();
    while (true)
    {
        std::clog << "> ";
        std::string line;
        std::getline(std::cin, line);
        std::size_t found = line.find_first_of(" ");
        std::string command = line.substr(0, found);

        const size_t lineSize = line.length();
        const size_t cmdSize = command.length();
        if (cmdSize == lineSize)
        {
            if (command.compare("quit") == 0)
            {
                break;
            }
            else
            {
                std::cerr << "Invalid command" << std::endl;
            }
        }
        else
        {
            if (command.compare("chkb") == 0)
            {
                std::string text = line.substr(found);
                std::vector<uint16_t> uiText((text.size() + 1));
                std::copy_n(text.data(), text.size(), reinterpret_cast<uint16_t *>(uiText.data()));
                std::vector<MisspelledRange> misspelled_ranges = impl->CheckSpelling(uiText.data(), uiText.size());
                std::string result;
                std::vector<MisspelledRange>::const_iterator iter = misspelled_ranges.begin();
                std::cout << "{\"result\": [";
                for (; iter != misspelled_ranges.end(); ++iter)
                {
                    uint32_t start = (uint32_t)iter->start;
                    uint32_t end = (uint32_t)iter->end;
                    std::vector<std::string> corrections = impl->GetCorrectionsForMisspelling(text.substr(start, end - start));
                    std::cout << "{\"start\":" << start << ", \"end\" : " << end << ", \"corrections\": [";
                    for (size_t i = 0; i < corrections.size(); ++i)
                    {
                        const std::string &correction = corrections[i];
                        std::cout << "\"" << correction << "\"";
                        if (i != corrections.size() - 1)
                        {
                            std::cout << ',';
                        }
                    }
                    std::cout << "]}";
                    if ((iter + 1) != misspelled_ranges.end())
                    {
                        std::cout << ",";
                    }
                }
                std::cout << "]}" << std::endl;
            }
        }
    }
    return 0;
}
