// Firebaseの設定
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

// 目標値の設定
const goals = {
    week: {
        situp: 500,    // 腹筋の週間目標
        backex: 500,   // 背筋の週間目標
        lunge: 1000,   // ランジの週間目標（メートル）
        pullup: 100    // 懸垂の週間目標
    },
    month: {
        situp: 2000,   // 腹筋の月間目標
        backex: 2000,  // 背筋の月間目標
        lunge: 4000,   // ランジの月間目標（メートル）
        pullup: 400    // 懸垂の月間目標
    }
};

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
    Chart.defaults.animation = false; // グラフのアニメーションを無効化
    
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
            animation: {
                duration: 0 // アニメーションを無効化
            },
            responsiveAnimationDuration: 0, // レスポンシブ時のアニメーションも無効化
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
    // グラフの更新を遅延実行
    requestAnimationFrame(() => {
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
        activityChart.update('none'); // アニメーションを無効化
    });
}

// 表示の更新
function updateDisplay() {
    const exercise = exercises[currentExercise];
    
    // 基本情報の更新
    document.getElementById('total').textContent = exercise.total.toLocaleString();
    document.getElementById('unit').textContent = exercise.unit;
    
    // 即時更新に変更
    updateRanking(exercise);
    updateHistory(exercise);
    
    // グラフの更新
    updateChart();
}

// 目標達成状況の更新
function updateGoalProgress() {
    const exercise = exercises[currentExercise];
    const currentDate = new Date();
    const isMonthEnd = currentDate.getDate() === new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    const goalType = isMonthEnd ? 'month' : 'week';
    const goal = goals[goalType][currentExercise];
    const progress = (exercise.total / goal) * 100;
    
    document.getElementById('currentGoal').textContent = 
        `${goal.toLocaleString()}${exercise.unit}`;
    document.getElementById('achievementRate').textContent = 
        `${Math.round(progress)}%`;
    
    const progressBar = document.getElementById('goalProgress');
    if (progressBar) {
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    }
}

// ランキングの更新
// ランキングの更新
function updateRanking(exercise) {
    console.log('Updating ranking...'); // デバッグ用
    const rankingDiv = document.getElementById('ranking');
    if (!rankingDiv) {
        console.error('Ranking div not found');
        return;
    }

    rankingDiv.innerHTML = ''; // 既存の内容をクリア
    
    const rankingArray = Object.entries(exercise.rankings)
        .map(([name, total]) => ({name, total}))
        .sort((a, b) => b.total - a.total);

    console.log('Ranking data:', rankingArray); // デバッグ用

    rankingArray.forEach((item, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = `ranking-item${index < 3 ? ' top' : ''}`;
        
        rankingItem.innerHTML = `
            <div class="ranking-content">
                <span class="ranking-position">${index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}位`}</span>
                <span class="ranking-name">${item.name}</span>
                <span class="ranking-score">${item.total.toLocaleString()}${exercise.unit}</span>
            </div>
        `;
        rankingDiv.appendChild(rankingItem);
    });
}

// 履歴の更新
function updateHistory(exercise) {
    console.log('Updating history...'); // デバッグ用
    const historyDiv = document.getElementById('history');
    if (!historyDiv) {
        console.error('History div not found');
        return;
    }

    historyDiv.innerHTML = ''; // 既存の内容をクリア
    
    console.log('History data:', exercise.history); // デバッグ用

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
            showMessage('データの保存に失敗しました', 'error');
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
            showMessage('データの読み込みに失敗しました', 'error');
        });
}

// リアルタイム更新のリスナー
function setupRealtimeListener() {
    let updateTimeout;
    db.ref('exercises').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            exercises = data;
            
            // 連続した更新をまとめる
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                updateDisplay();
                updateChart();
            }, 100);
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
