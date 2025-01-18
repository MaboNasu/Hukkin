// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeeWjIe1eEf9niClALyPyc0s4OWfMAf74",
  authDomain: "exercise-counter-3fe3f.firebaseapp.com",
  databaseURL: "https://exercise-counter-3fe3f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "exercise-counter-3fe3f",
  storageBucket: "exercise-counter-3fe3f.firebasestorage.app",
  messagingSenderId: "772240706373",
  appId: "1:772240706373:web:d8d0021b41820eac608c2c"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// データの初期化
let currentExercise = 'situp';
let exercises = {
    situp: { total: 0, history: [], rankings: {}, unit: '回' },
    backex: { total: 0, history: [], rankings: {}, unit: '回' },
    lunge: { total: 0, history: [], rankings: {}, unit: 'm' },
    pullup: { total: 0, history: [], rankings: {}, unit: '回' }
};

// グラフの表示期間
let graphPeriod = 7; // デフォルトは7日間
let activityChart;

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
    setupGraphPeriodButtons();
    setupResetButton();

    // タブ切り替えのイベントリスナーを設定
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const exercise = this.getAttribute('data-exercise');
            switchTab(exercise);
        });
    });

    // データの読み込みとリアルタイム更新の設定
    loadData();
    setupRealtimeListener();
});

// グラフの初期化
function initializeChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');
    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '1日の合計',
                data: [],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '回数'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '日付'
                    }
                }
            }
        }
    });
}

// グラフ期間切り替えボタンの設定
function setupGraphPeriodButtons() {
    document.querySelectorAll('.period-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.period-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            graphPeriod = parseInt(this.getAttribute('data-days'));
            updateChart();
        });
    });
}

// タブの切り替え
function switchTab(exercise) {
    currentExercise = exercise;

    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`[data-exercise="${exercise}"]`).classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(exercise).classList.add('active');

    updateDisplay();
    updateChart();
}

// 記録の追加
function addRecord(exercise, unit) {
    const nameInput = document.getElementById(`nameInput_${exercise}`);
    const numberInput = document.getElementById(`numberInput_${exercise}`);
    const name = nameInput.value.trim();
    const number = parseInt(numberInput.value);

    if (!validateInput(name, number, unit)) return;

    const now = new Date();
    const record = {
        name: name,
        number: number,
        date: formatDate(now),
        time: formatTime(now),
        timestamp: now.getTime()
    };

    if (!exercises[exercise].history) {
        exercises[exercise].history = [];
    }
    exercises[exercise].history.unshift(record);
    if (exercises[exercise].history.length > 30) {
        exercises[exercise].history.pop();
    }

    if (!exercises[exercise].rankings) {
        exercises[exercise].rankings = {};
    }
    if (!exercises[exercise].rankings[name]) {
        exercises[exercise].rankings[name] = 0;
    }
    exercises[exercise].rankings[name] += number;
    exercises[exercise].total += number;

    // Firebaseにデータを保存
    saveData();

    updateDisplay();
    updateChart();
    numberInput.value = '';
    showMessage('記録を保存しました！', 'success');
}

// グラフの更新
function updateChart() {
    const today = new Date();
    const labels = [];
    const data = [];

    for (let i = graphPeriod - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);
        labels.push(dateStr);

        const dayTotal = exercises[currentExercise].history
            .filter(record => record.date === dateStr)
            .reduce((sum, record) => sum + record.number, 0);

        data.push(dayTotal);
    }

    activityChart.data.labels = labels;
    activityChart.data.datasets[0].data = data;
    activityChart.options.scales.y.title.text =
        currentExercise === 'lunge' ? '距離(m)' : '回数';
    activityChart.update();
}

// 表示の更新
function updateDisplay() {
    const exercise = exercises[currentExercise];
    document.getElementById('total').textContent = exercise.total.toLocaleString();
    document.getElementById('unit').textContent = exercise.unit;
    updateRanking(exercise);
    updateHistory(exercise);
}

// ランキングの更新
function updateRanking(exercise) {
    const rankingDiv = document.getElementById('ranking');
    rankingDiv.innerHTML = '';

    const rankingArray = Object.entries(exercise.rankings)
        .map(([name, total]) => ({name, total}))
        .sort((a, b) => b.total - a.total);

    rankingArray.forEach((item, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = `ranking-item${index < 3 ? ' top' : ''}`;

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

// データの保存
function saveData() {
    db.ref('exercises').set(exercises)
        .then(() => {
            console.log('Data saved successfully');
        })
        .catch((error) => {
            console.error('Data save failed:', error);
        });
}

// データの読み込み
function loadData() {
    db.ref('exercises').once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                exercises = data;
                updateDisplay();
                updateChart();
            }
        })
        .catch((error) => {
            console.error('Data load failed:', error);
        });
}

// リアルタイム更新のリスナー
function setupRealtimeListener() {
    db.ref('exercises').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            exercises = data;
            updateDisplay();
            updateChart();
        }
    });
}

// 入力値の検証
function validateInput(name, number, unit) {
    if (name === '') {
        showMessage('名前を入力してください', 'error');
        return false;
    }
    if (!number || number <= 0) {
        showMessage(`有効な${unit === 'm' ? '距離' : '回数'}を入力してください`, 'error');
        return false;
    }
    return true;
}

// 初期化ボタンの設定
function setupResetButton() {
    const resetButton = document.getElementById('resetButton');
    const resetModal = document.getElementById('resetModal');
    const confirmReset = document.getElementById('confirmReset');
    const cancelReset = document.getElementById('cancelReset');

    resetButton.addEventListener('click', () => {
        resetModal.style.display = 'block';
    });

    cancelReset.addEventListener('click', () => {
        resetModal.style.display = 'none';
    });

    resetModal.addEventListener('click', (e) => {
        if (e.target === resetModal) {
            resetModal.style.display = 'none';
        }
    });

    confirmReset.addEventListener('click', () => {
        const password = document.getElementById('resetPassword').value;
        if (password === 'NaboDofu123') {
            resetAllData();
        } else {
            showMessage('パスワードが正しくありません', 'error');
        }
    });
}

// データのリセット
function resetAllData() {
    exercises = {
        situp: { total: 0, history: [], rankings: {}, unit: '回' },
        backex: { total: 0, history: [], rankings: {}, unit: '回' },
        lunge: { total: 0, history: [], rankings: {}, unit: 'm' },
        pullup: { total: 0, history: [], rankings: {}, unit: '回' }
    };

    // Firebaseのデータをリセット
    saveData();

    updateDisplay();
    updateChart();
    document.getElementById('resetModal').style.display = 'none';
    showMessage('すべての記録を初期化しました', 'success');
}

// ユーティリティ関数
function formatDate(date) {
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
}

function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function showMessage(message, type) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
