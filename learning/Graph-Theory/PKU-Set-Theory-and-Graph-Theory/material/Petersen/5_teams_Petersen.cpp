/**********************************************************************
 * author:      banbao                                                *
 * language:    c++/c                                                 *
 **********************************************************************/

/*
 * bbq:
*/

 /* library */
#include <stdio.h>
#include <cstdio>
#include <malloc.h>
#include <algorithm>
#include <cmath>
#include <cstring>
#include <string.h>
#include <math.h>
#include <memory.h>
#include <bitset>
#include <set>
#include <map>
#include <stack>
#include <queue>
#include <vector>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <iostream>
using namespace std;

/* micros */
#define lowbit(x) ((x)&(-x))
#define leftson(x) ((x<<1)+1)
#define rightson(x) ((x<<1)+2)
#define parent(x) ((x-1)>>1)
#define mid(x,y) (((x)+(y))>>1)

/* functions */
template<class T>
inline int ABS(T a) { return a < 0 ? -a : a; }
template<class T>
inline void MYSWAP(T &a, T &b) {
    T c = a;
    a = b;
    b = c;
}
void init();

/* pragmas */
#pragma warning(disable:4996)

/* const variables */
const int INF_INT = 1 << 29;
const double PI = acos((double)-1);
const double INF = 1e20;
const double EPS = 1e-6;

/* code start here */
const int totalEdge = 15;

struct Edge {
    int l, r;
    Edge() {}
    Edge(int _l, int _r) :l(_l), r(_r) {}
};

inline bool haveSameTeam(string &a, string &b) {
    return ((a[0] == b[0]) || (a[0] == b[1]) || (a[1] == b[0]) || (a[1] == b[1]));
}

int main() {
    Edge edge[totalEdge];
    freopen("./5_teams_Petersen.txt", "r", stdin);
    freopen("./paint.txt", "w", stdout);

    /* input the edge */
    int num = -1;
    for (int l = 0; l < 10; ++l) {
        for (int j = 0; j < 3; ++j) {
            int r;
            cin >> r;
            if (l < r) edge[++num] = Edge(l, r);
        }
    }

    /* team */
    num = 0;
    string team[10] = {};
    char base = 'a';
    for (int i = 0; i < 5; ++i) {
        for (int j = i + 1; j < 5; ++j) {
            team[num] = (team[num] + char(base + i)) + char(base + j);
            ++num;
        }
    }

    /* deal */
    bool OK = false;
    string paint = "0123456789";
    while (next_permutation(paint.begin(), paint.end())) {
        int i = 0;
        for (; i < totalEdge; ++i) {
            int l = (int)paint.find('0' + edge[i].l);
            int r = (int)paint.find('0' + edge[i].r);
            if (haveSameTeam(team[l], team[r]))
                break;
        }
        if (i == totalEdge) {
            OK = true;
            break;
        }
    }

    if (!OK) printf("no paint!\n");
    else {
        string out[10];
        for (int i = 0; i < 10; ++i)
            out[paint[i] - '0'] = team[i];

        for (int i = 0; i < 10; ++i)
            cout << i << ':' << out[i] << endl;
    }
    return 0;
}

void init() {}
