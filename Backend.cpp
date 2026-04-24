#include <iostream>
#include <fstream>
#include <vector>
#include <sstream>
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
    string search = argv[2];

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
        string distr; // because distance is initially a string

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
        if (o.name == search) {
            cout << "The distance to travel to " << o.name << " is " << o.dist << ".\n";
            cout << "One year on that object is " << o.time << " days.\n";
            cout << "The object is a " << o.stat << ".\n";
            return 0;
        }
    }

    cout << "Object not found.\n";
    return 1;
}
