// データの初期化
let currentExercise = 'situp';
let exercises = {
    situp: { total: 0, history: [], rankings: {}, unit: '回' },
    backex: { total: 0, history: [], rankings: {}, unit: '回' },
    lunge: { total: 0, history: [], rankings: {}, unit: 'm' }
};

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
    // タブ切り替えのイベントリスナーを設定
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const exercise = this.getAttribute('data-exercise');
            switchTab(exercise);
        });
    });

    // 初期表示の更新
    updateDisplay();
});

// タブの切り替え
function switchTab(exercise) {
    // 現在の種目を更新
    currentExercise = exercise;

    // タブのアクティブ状態を更新
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`[data-exercise="${exercise}"]`).classList.add('active');

    // コンテンツの表示を切り替え
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(exercise).classList.add('active');

    // 表示を更新
    updateDisplay();

    // グラフを更新
    updateChart();
}

// 記録の追加
function addRecord(exercise, unit) {
    const nameInput = document.getElementById(`nameInput_${exercise}`);
    const numberInput = document.getElementById(`numberInput_${exercise}`);
    const name = nameInput.value.trim();
    const number = parseInt(numberInput.value);

    // 入力値のチェック
    if (name === '') {
        alert('名前を入力してください');
        return;
    }
    if (!number || number <= 0) {
        alert('有効な数値を入力してください');
        return;
    }

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
    if (!exercises[exercise].rankings[name]) {
        exercises[exercise].rankings[name] = 0;
    }
    exercises[exercise].rankings[name] += number;
    exercises[exercise].total += number;

    // 表示を更新
    updateDisplay();

    // 入力欄をクリア
    numberInput.value = '';

    // 成功メッセージを表示
    showMessage('記録を保存しました！', 'success');

    // LocalStorageにデータを保存
    saveToLocalStorage();
    // グラフを更新
    updateChart();
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

// LocalStorageにデータを保存
function saveToLocalStorage() {
    localStorage.setItem('exerciseData', JSON.stringify(exercises));
}

// LocalStorageからデータを読み込む
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('exerciseData');
    if (savedData) {
        exercises = JSON.parse(savedData);
        updateDisplay();
    }
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
// グラフの初期化
let activityChart;

// グラフの初期化関数
function initializeChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');
    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // 日付ラベル
            datasets: [{
                label: '1日の合計',
                data: [], // データポイント
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

// グラフの表示期間
let graphPeriod = 7; // デフォルトは7日間

// グラフの更新関数
function updateChart() {
    const today = new Date();
    const labels = [];
    const data = [];

    // 指定された日数分のデータを準備
    for (let i = graphPeriod - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);
        labels.push(dateStr);

        // その日の合計を計算
        const dayTotal = exercises[currentExercise].history
            .filter(record => record.date === dateStr)
            .reduce((sum, record) => sum + record.number, 0);

        data.push(dayTotal);
    }

    // グラフの更新
    activityChart.data.labels = labels;
    activityChart.data.datasets[0].data = data;
    activityChart.options.scales.y.title.text =
        currentExercise === 'lunge' ? '距離(m)' : '回数';
    activityChart.update();
}

// グラフ期間切り替えの処理を追加
function setupGraphPeriodButtons() {
    document.querySelectorAll('.period-button').forEach(button => {
        button.addEventListener('click', function() {
            // アクティブなボタンの更新
            document.querySelectorAll('.period-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // 期間の更新
            graphPeriod = parseInt(this.getAttribute('data-days'));
            updateChart();
        });
    });
}

// 初期化関連の機能
const RESET_PASSWORD = 'MaboDofu123';

// 初期化ボタンのイベントリスナー設定
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

    // モーダルの外側をクリックした時に閉じる
    resetModal.addEventListener('click', (e) => {
        if (e.target === resetModal) {
            resetModal.style.display = 'none';
        }
    });

    confirmReset.addEventListener('click', () => {
        const password = document.getElementById('resetPassword').value;
        if (password === RESET_PASSWORD) {
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
        lunge: { total: 0, history: [], rankings: {}, unit: 'm' }
    };

    // LocalStorageのクリア
    localStorage.removeItem('exerciseData');

    // 表示の更新
    updateDisplay();
    updateChart();

    // モーダルを閉じる
    document.getElementById('resetModal').style.display = 'none';

    showMessage('すべての記録を初期化しました', 'success');
}
document.addEventListener('DOMContentLoaded', () => {
    // グラフの初期化
    initializeChart();

    // グラフ期間切り替えボタンの設定
    setupGraphPeriodButtons();

    // タブ切り替えのイベントリスナーを設定
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const exercise = this.getAttribute('data-exercise');
            switchTab(exercise);
        });
    });

    // 初期化ボタンの設定
    setupResetButton();

    // 初期データの読み込みと表示の更新
    loadFromLocalStorage();
    updateDisplay();
    updateChart();
});

// 初期データの読み込み
loadFromLocalStorage();
