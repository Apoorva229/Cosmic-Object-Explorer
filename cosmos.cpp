#include <iostream>
#include <fstream>
#include <vector>
#include <sstream>
#include <cctype>
using namespace std;

struct Object {
    string name;
    int dist;
    int time;
    string stat;
};
int main(int argc, char* argv[]) {
    if(argc < 3){
        cout <<"Usage: ./space <file> <search>\n";
        return 1;
    }
    ifstream file(argv[1]);
    string search = "";
    // for search for multiple words
    for(int i = 2; i< argc; i++){
        search += argv[i];
        if(i != argc - 1){
            search += " ";
        }
    }
    for(int i = 0; i< search.length(); i++){
        search[i] = tolower(search[i]);
    }

    if (!file) {
        cout << "Error opening file\n";
        return 1;
    }

    vector<Object> objects;
    string line;
    // read file line by line
    while (getline(file, line)) {
        stringstream ss(line);
        Object obj;
        string distr; //  a temperory variable because distance is initially a string

        getline(ss, obj.name, ',');

        getline(ss, distr, ',');
        obj.dist = stoi(distr);

        getline(ss, distr, ',');
        obj.time = stoi(distr);

        getline(ss, obj.stat, ',');

        objects.push_back(obj);
    }

    file.close();
    for (auto &o : objects) {
        string namelow = o.name;
        for(int i = 0; i< namelow.length(); i++){
            namelow[i]= tolower(namelow[i]);
        }
        if (namelow == search) {
            cout << "The distance to travel to " << o.name << " is " << o.dist << ".\n";
            cout << "One year on that object is " << o.time << " days.\n";
            cout << "The object is a " << o.stat << ".\n";
            return 0;
        }
    }
    cout << "Object not found.\n";
    return 1;
}
