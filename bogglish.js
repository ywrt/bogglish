let board;
let letterFrequency = {
  'A': 8.4966,
  'B': 2.0720,
  'C': 4.5388,
  'D': 3.3844,
  'E': 11.1607,
  'F': 1.8121,
  'G': 2.4705,
  'H': 3.0034,
  'I': 7.5448,
  'J': 0.1965,
  'K': 1.1016,
  'L': 5.4893,
  'M': 3.0129,
  'N': 6.6544,
  'O': 7.1635,
  'P': 3.1671,
  'Q': 0.1962,
  'R': 7.5809,
  'S': 5.7351,
  'T': 6.9509,
  'U': 3.6308,
  'V': 1.0074,
  'W': 1.2899,
  'X': 0.2902,
  'Y': 1.7779,
  'Z': 0.2722,
};

function textDiv(s) {
  const n = document.createElement('div');
  n.className = 'dice';
  n.innerText = s;
  return n;
}

// Build word trie
let wordTrie = {};
for (let w of wordList) {
  let p = wordTrie;
  for (let l of w) {
    if (!(l in p)) {
      p[l] = {};
    }
    p = p[l];
  }
  p.word = true;
}
console.log('done');

class Board {
  constructor(width) {
	  let b = [];
	  const board = document.querySelector('#board');
	  // clear children.
	  for (let child = board.lastElementChild; child ; child = board.lastElementChild) {
	    board.removeChild(child);
	  }
	  // add cols/rows.
	  for (let i = 0; i < width; ++i) {
	    let row = [];
	    b.push(row);
	    for (let j = 0; j < width; ++j) {
	      let div = textDiv('.');
              div.used = false;
	      row.push(div);
	      board.appendChild(div);
	    }
	  }
    this.board = b;
    this.width = width;
	}

  randLetter() {
    // weighted random
    let r = Math.random() * 100;
    let sum = 0;
    for (let l in letterFrequency) {
      sum += letterFrequency[l];
      if (sum > r) {
        return l;
      }
    }
    return 'Q';
  }

  jumble() {
    for (let row of this.board) {
      for (let c of row) {
        let letter = this.randLetter();
        c.innerText = letter;
      }
    }
  }
  getBoard() {
    let s = '';
    for (let row of this.board) {
      for (let c of row) {
	s += c.innerText;
      }
    }
    return s;
  }

  setBoard(s) {
    let idx = 0;
    for (let row of this.board) {
      for (let c of row) {
	c.innerText = s[idx];
	idx++;
      }
    }
  }

  dice(x,y) {
    return this.board[y][x].innerText;
  }

  search(x, y, p, s, r, minlen) {
    // at x, y. position 'p' in the wordTrie. 's' is string so far. r is array of results.
    let d = this.dice(x, y);
    p = p[d];
    s = s + d;
    if (p === undefined) return;  // no words past here.
    if (this.board[y][x].used) return;  // already used this letter.

    this.board[y][x].used = true;

    if (p.word && s.length >= minlen) {
      r.add(s);
    }
    for (let dx = -1 ; dx <= 1; ++ dx) {
      for (let dy = -1; dy <= 1 ; ++dy) {
        if ((x + dx) < 0 || (x + dx) >= this.width) continue;
        if ((y + dy) < 0 || (y + dy) >= this.width) continue;
        this.search(x + dx, y + dy, p, s, r, minlen);
      }
    }

    this.board[y][x].used = false;
  }

  solve(minlen) {
    let results = new Set();
    for (let y = 0; y < this.width; ++y) {
      for (let x = 0; x < this.width; ++x) {
        this.search(x, y, wordTrie, '', results, minlen);
      }
    }
    let r = [];
    for (let w of results) {
	r.push(w);
    }
    return r;
  }

  makeBoard() {
    let best = -1;
    let bestBoard = '';
    for (let tries = 0; tries < 20; ++tries) {
      this.jumble();
      let words = this.solve(5);
      if (words.length > best) {
        best = words.length;
        bestBoard = this.getBoard();
      }
    }
    console.log(best + ' words');
    this.setBoard(bestBoard);
  }
}

board = new Board(4);  // 4x4 board

const make = document.querySelector('#make');
make.onclick = function() {
  const div = document.querySelector('#words');
  for (let child = div.lastElementChild; child ; child = div.lastElementChild) {
    div.removeChild(child);
  }
  board.makeBoard();
}

const solve = document.querySelector('#solve');
solve.onclick = function() {
  let words = board.solve(5); // min len word = 5
  words.sort();
  const div = document.querySelector('#words');
  for (let w of words) {
    const n = document.createElement('div');
    n.innerText = w;
    div.appendChild(n);
  }
}
