export const BOILERPLATES = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << "Sum: " << (a + b) << endl;
    } else {
        cout << "Hello World!" << endl;
    }
    return 0;
}`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            int a = scanner.nextInt();
            int b = scanner.nextInt();
            System.out.println("Sum: " + (a + b));
        } else {
            System.out.println("Hello World!");
        }
    }
}`,
  python: `import sys

lines = sys.stdin.read().split()
if len(lines) >= 2:
    a, b = int(lines[0]), int(lines[1])
    print(f"Sum: {a + b}")
else:
    print("Hello World!")`,
};

export const LANGUAGE_LABELS = {
  cpp: "C++17",
  java: "Java 21",
  python: "Python 3",
};
