const iterCells = (className, callBack) => {
    const cell = document.getElementsByClassName(className)
    Array.from(cell).forEach(cellCallBack => {
        callBack(cellCallBack)
    })
}

const iterCellsId = (id, callBack) => {
    const cell = document.getElementById(id)
    Array.from(cell).forEach(cellCallBack => {
        callBack(cellCallBack)
    })
}

const shuffle = (arr) => {
    let j, temp;
    for(let i = arr.length - 1; i > 0; i--){
        j = Math.floor(Math.random()*(i + 1));
        temp = arr[j];
        arr[j] = arr[i];
        arr[i] = temp;
    }
    return arr;
}

const cellArr = new Array;
const createCells = (buttonName, clear) => {
    if (clear === 1) {
        cellArr.length = 0;
        document.querySelectorAll('.gameCell').forEach(el => el.remove())
    }

    const tempArr = new Array;
    for (let i = 0; i < 10; i++) {tempArr.push('bombCell')}
	for (let i = 0; i < 71; i++) {tempArr.push('emptyCell')}
	shuffle(tempArr);

    const cellContainer = document.getElementById('backgroundBoard');
    
    for (let r = 0; r < 9; r++) {
        cellArr[r] = [];
        for (let c = 0; c < 9; c++) {
            cellArr[r][c] = tempArr[r * 9 + c]
        }
	}

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const div = document.createElement('div');
            div.classList.add('gameCell', cellArr[r][c])
            div.id = `cell-${r}-${c}`
            cellContainer.appendChild(div)
        }
    }

    calculateNearMines()
    document.getElementById(buttonName).disabled = true;
    addRules()
}


const createWindow = () => {
    const cellContainer = document.getElementById('backgroundBoard')
    const div = document.createElement('div')
    div.classList.add('notification')
    div.id = 'restartWindow'
    div.style.opacity = 0;
    div.innerHTML = `<p>Жаль, но вы проиграли. Попробуйте снова!</p> <button id='restartButton'>Рестарт!</button>`
    cellContainer.appendChild(div);
    const btnWindow = document.getElementById('restartButton')
    btnWindow.onclick = () => {
        delWindow('restartWindow'); 
        createCells("restartButton", 1);
        resetTimer();
    }
    setTimeout(() => div.style.opacity = 1, 1000)
}
const delWindow = (windowId) => {
    let parent = document.getElementById('backgroundBoard');
    let child = document.getElementById(windowId);
    child.style.opacity = 0;
    setTimeout(() => parent.removeChild(child), 1000);
}


const addRules = () => {
    iterCells('emptyCell', cell => {
        cell.addEventListener('click', handleEmptyClick)
    })
    iterCells('bombCell', cell => {
        cell.addEventListener('click', handleBombClick)
    })

    iterCells('gameCell', cell => {
        cell.classList.add('hoverCell');
        cell.addEventListener('contextmenu', handleCellMarker);
        cell.addEventListener('click', handlerNearCell)
    })
}


const delRules = () => {
    iterCells('emptyCell', cell => {
        cell.removeEventListener('click', handleEmptyClick)
    })
    iterCells('bombCell', cell => {
        cell.removeEventListener('click', handleBombClick)
    })

    iterCells('gameCell', cell => {
        cell.classList.remove('hoverCell');
        cell.removeEventListener('contextmenu', handleCellMarker);
        cell.removeEventListener('click', handlerNearCell)
    })
}


const handleEmptyClick = (event) => {
    const cell = event.currentTarget;
    const sound = document.getElementById('soundForGameCell');
    sound.play();
    showEmpty(cell.id);
}

const handleBombClick = (event) => {
    const sound = document.getElementById('soundForBombCell')
    sound.play()
    showBombs();
    stopTimer()
}
const handleCellMarker = (event) => {
    event.preventDefault();
    
    let cell = event.currentTarget;

    if (cell.classList.contains('markered')) {
        cell.innerHTML = '';
        cell.classList.remove('markered');
    } else {
        cell.innerHTML = '<img src="./image/mark.png" alt="flag" style="width:70%; height:70%;">';
        cell.classList.add('markered');
    }
    const sound = document.getElementById('soundForMarkCell')
    sound.play()
}
const handlerNearCell = (event) => {
    const cell = event.currentTarget;
    const parts = cell.id.split('-');
    const row = parseInt(parts[1]);
    const col = parseInt(parts[2]);

    const count = nearMines[row][col];

    if (count === -1) {
        cell.innerText = "💣"; // попал на бомбу
        cell.style.backgroundColor = "red";
    } else {
        revealCell(row, col);
    }
}

const nearMines = Array.from({ length: 9 }, () => Array(9).fill(0));
const calculateNearMines = () => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (cellArr[r][c] === 'bombCell') {
                nearMines[r][c] = -1;
                continue;
            }

            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;

                    let nr = r + dr;
                    let nc = c + dc;

                    if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                        if (cellArr[nr][nc] === 'bombCell') {
                            count++;
                        }
                    }
                }
            }
            nearMines[r][c] = count;
        }
    }
};

const revealCell = (row, col) => {
    const cell = document.getElementById(`cell-${row}-${col}`);
    if (!cell || cell.dataset.opened === "true") return;

    const count = nearMines[row][col];
    cell.dataset.opened = "true";
    cell.style.backgroundColor = "white";
    cell.style.boxShadow = "0 0 30px rgb(255,255,255)";

    if (count > 0) {
        cell.innerText = count;
        if (count === 1) cell.style.color = "blue";
        else if (count === 2) cell.style.color = "orange";
        else cell.style.color = "red";
    } else {
        cell.innerText = "";
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                let nr = row + dr;
                let nc = col + dc;
                if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                    revealCell(nr, nc);
                }
            }
        }
    }
};

const showEmpty = (cellId) => {
    const cell = document.getElementById(cellId);
    const parts = cellId.split('-');
    const r = parseInt(parts[1]);
    const c = parseInt(parts[2]);
    const count = nearMines[r][c];

    cell.style.cssText = 'box-shadow: 0 0 30px rgb(255, 255, 255)';
    cell.style.backgroundColor = "white";

    if (cell.classList.contains("openedCell")) return;
    cell.classList.add("openedCell");

    if (count === 0) {
        cell.style.color = 'black';
    } else if (count === 1) {
        cell.style.color = 'blue';
    } else if (count === 2) {
        cell.style.color = 'orange';
    } else {
        cell.style.color = 'red';
    }

    if (count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                const nr = r + dr;
                const nc = c + dc;

                if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                    const neighborId = `cell-${nr}-${nc}`;
                    showEmpty(neighborId);
                }
            }
        }
    }

    if (document.querySelectorAll('.openedCell').length === 71) {
        win();
    }
}


const showBombs = () => {
    iterCells('bombCell', cell => {
        cell.style.cssText = 
            'transition: 1s; box-shadow: 0 0 50px red;'
        cell.style.background = 'linear-gradient(red, #590303)'
    })
    delRules()
    setTimeout(createWindow(), 1500)
    
}

let seconds = 0;
let timerInterval;
const formatTime = (sec) => {
    let min = Math.floor(sec / 60);
    let s = sec % 60;

    if (min < 10) min = "0" + min;
    if (s < 10) s = "0" + s;

    return `${min}:${s}`;
}

const updateDisplay = () => {
    document.getElementById("timerOfRound").textContent = formatTime(seconds);
}

const startTimer = () => {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
        seconds++;
        updateDisplay();
    }, 1000);
}

const stopTimer = () => {
    clearInterval(timerInterval);
    timerInterval = null;
}

const resetTimer = () => {
    stopTimer();
    seconds = 0;
    updateDisplay();
    startTimer();
}

const win = () => {
    const cellContainer = document.getElementById('backgroundBoard')
    const div = document.createElement('div')
    div.classList.add('notification')
    div.id = 'winWindow'
    div.style.opacity = 0;
    div.innerHTML = `<p>Поздравляю! Вы всё же победили!</p> <button id='winButton'>Ещё раз!</button>`
    cellContainer.appendChild(div);
    const btnWindow = document.getElementById('winButton')
    btnWindow.onclick = () => {
        delWindow('winWindow'); 
        createCells("winButton", 1);
        resetTimer();
    }
    stopTimer()
    setTimeout(() => div.style.opacity = 1, 1000)
}