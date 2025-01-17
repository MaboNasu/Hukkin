// データの初期化
let currentExercise = 'situp';
let exercises = {
    situp: { total: 0, history: [], rankings: {}, unit: '回' },
    backex: { total: 0, history: [], rankings: {}, unit: '回' },
    lunge: { total: 0, history: [], rankings: {}, unit: 'm' }
};

// ページ読み込み時にローカルストレージからデータを読み込む
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateDisplay();

    // タブボタンにイベントリスナーを追加
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const exercise = e.target.getAttribute('data-exercise');
            switchTab(exercise);
        });
    });
});

// タブの切り替え
function switchTab(exercise) {
    currentExercise = exercise;

    // タブのアクティブ状態を更新
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-exercise') === exercise) {
            button.classList.add('active');
        }
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 対応するコンテンツをアクティブに
    document.getElementById(exercise).classList.add('active');

    // 表示を更新
    updateDisplay();
}

// 記録の追加
function addRecord(exercise, unit) {
    const nameInput = document.getElementById(`nameInput_${exercise}`);
    const numberInput = document.getElementById(`numberInput_${exercise}`);
    const name = nameInput.value.trim();
    const number = parseInt(numberInput.value);

    // バリデーションチェック
    if (!validateInput(name, number, unit)) return;

    // 現在の日時を取得
    const now = new Date();
    const dateStr = formatDate(now);
    const timeStr = formatTime(now);

    // 記録を作成
    const record = {
        name: name,
        number: number,
        date: dateStr,
        time: timeStr
    };

    // 記録を追加
    if (!exercises[exercise].history) {
        exercises[exercise].history = [];
    }
    exercises[exercise].history.unshift(record);
    if (exercises[exercise].history.length > 30) {
        exercises[exercise].history.pop();
    }

    // ランキングを更新
    if (!exercises[exercise].rankings) {
        exercises[exercise].rankings = {};
    }
    if (!exercises[exercise].rankings[name]) {
        exercises[exercise].rankings[name] = 0;
    }
    exercises[exercise].rankings[name] += number;

    // 合計を更新
    if (!exercises[exercise].total) {
        exercises[exercise].total = 0;
    }
    exercises[exercise].total += number;

    // 表示を更新
    updateDisplay();
    saveData();

    // 入力欄をクリア
    numberInput.value = '';

    // 成功メッセージを表示
    showMessage('記録を保存しました！', 'success');
}

// 入力値の検証
function validateInput(name, number, unit) {
    if (name === '') {
        showMessage('名前を入力してください', 'error');
        return false;
    }
    if (number <= 0 || isNaN(number)) {
        showMessage(`有効な${unit === 'm' ? '距離' : '回数'}を入力してください`, 'error');
        return false;
    }
    return true;
}

// 表示の更新
function updateDisplay() {
    const exercise = exercises[currentExercise];

    // 合計の更新
    document.getElementById('total').textContent = exercise.total.toLocaleString();
    document.getElementById('unit').textContent = exercise.unit;

    // ランキングの更新
    updateRanking(exercise);

    // 履歴の更新
    updateHistory(exercise);
}

// ランキングの更新
function updateRanking(exercise) {
    const rankingDiv = document.getElementById('ranking');
    rankingDiv.innerHTML = '';

    // ランキングの配列を作成してソート
    const rankingArray = Object.entries(exercise.rankings)
        .map(([name, total]) => ({name, total}))
        .sort((a, b) => b.total - a.total);

    rankingArray.forEach((item, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = `ranking-item${index < 3 ? ' top' : ''}`;

        // ランキングの表示形式を設定
        const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}位`;
        rankingItem.innerHTML = `
            <div class="ranking-content">
                <span class="ranking-position">${medal}</span>
                <span class="ranking-name">${item.name}</span>
                <span class="ranking-score">${item.total.toLocaleString()}${exercise.unit}</span>
            </div>
        `;
        rankingDiv.appendChild(rankingItem);
    });
}

// 履歴の更新
function updateHistory(exercise) {
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = '';

    exercise.history.forEach(record => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-content">
                <div class="history-date">${record.date} ${record.time}</div>
                <div class="history-detail">
                    <span class="history-name">${record.name}</span>さんが
                    <span class="history-number">${record.number.toLocaleString()}${exercise.unit}</span>
                    実施
                </div>
            </div>
        `;
        historyDiv.appendChild(historyItem);
    });
}

// メッセージの表示
function showMessage(message, type) {
    // メッセージ要素が既に存在する場合は削除
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // 新しいメッセージ要素を作成
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    // メッセージを表示
    document.body.appendChild(messageDiv);

    // 3秒後にメッセージを消す
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 日付のフォーマット
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// 時刻のフォーマット
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// データの保存
function saveData() {
    localStorage.setItem('exerciseData', JSON.stringify(exercises));
}

// データの読み込み
function loadData() {
    const savedData = localStorage.getItem('exerciseData');
    if (savedData) {
        exercises = JSON.parse(savedData);
    }
}

// 画面サイズ変更時の処理
window.addEventListener('resize', () => {
    updateDisplay();
});

// 初期表示
updateDisplay();
