/* 基本設定 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f0f0f0;
    line-height: 1.6;
    color: #333;
}

/* コンテナ */
.container {
    max-width: 1000px;
    margin: 0 auto;
    background-color: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

/* ヘッダー */
h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 3px solid #3498db;
    font-size: 2.2em;
}

h2 {
    color: #2c3e50;
    margin-top: 20px;
    margin-bottom: 15px;
    font-size: 1.8em;
}

/* タブメニュー */
.tab-menu {
    margin: 20px 0;
    border-bottom: 2px solid #3498db;
    display: flex;
    gap: 5px;
}

.tab-button {
    padding: 12px 25px;
    font-size: 16px;
    background-color: #f0f0f0;
    border: none;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tab-button:hover {
    background-color: #e0e0e0;
}

.tab-button.active {
    background-color: #3498db;
    color: white;
    font-weight: bold;
}

/* タブコンテンツ */
.tab-content {
    display: none;
    padding: 25px;
    background-color: #fff;
    border-radius: 0 0 8px 8px;
}

.tab-content.active {
    display: block;
    animation: fadeIn 0.3s ease-in-out;
}

/* 入力セクション */
.input-section {
    margin: 20px 0;
    padding: 25px;
    background-color: #f8f9fa;
    border-radius: 12px;
    display: flex;
    gap: 20px;
    align-items: flex-end;
}

.input-group {
    flex: 1;
}

label {
    display: block;
    margin-bottom: 8px;
    color: #2c3e50;
    font-weight: 500;
}

input[type="text"],
input[type="number"] {
    width: 100%;
    padding: 12px 15px;
    font-size: 16px;
    border: 2px solid #ddd;
    border-radius: 8px;
    transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="number"]:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}

button {
    padding: 12px 30px;
    font-size: 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

button:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
}

/* グラフセクション */
.graphs-section {
    margin: 30px 0;
    padding: 25px;
    background-color: #f8f9fa;
    border-radius: 12px;
}

/* 結果セクション */
.result-section {
    margin: 30px 0;
    padding: 25px;
    background-color: #e8f4f8;
    border-radius: 12px;
    text-align: center;
}

.total-display {
    font-size: 2.5em;
    font-weight: bold;
    color: #2980b9;
}

/* ランキングセクション */
.ranking-section {
    margin: 30px 0;
    padding: 25px;
    background-color: #f8f9fa;
    border-radius: 12px;
}

.ranking-list {
    padding: 10px;
}

.ranking-item {
    padding: 15px 20px;
    margin: 10px 0;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
}

.ranking-item:hover {
    transform: translateY(-2px);
}

.ranking-item.top {
    background-color: #fff8e1;
    border-left: 4px solid #ffd700;
}

/* 履歴セクション */
.history-section {
    margin: 30px 0;
}

.history-list {
    max-height: 500px;
    overflow-y: auto;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 12px;
}

.history-item {
    padding: 15px 20px;
    margin: 10px 0;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* スクロールバーのカスタマイズ */
.history-list::-webkit-scrollbar {
    width: 8px;
}

.history-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.history-list::-webkit-scrollbar-thumb {
    background: #bdc3c7;
    border-radius: 4px;
}

.history-list::-webkit-scrollbar-thumb:hover {
    background: #95a5a6;
}

/* アニメーション */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* メッセージスタイル */
.message {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    animation: slideIn 0.5s ease-out;
    z-index: 1000;
}

.message-success {
    background-color: #2ecc71;
}

.message-error {
    background-color: #e74c3c;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
    .container {
        padding: 15px;
    }

    .input-section {
        flex-direction: column;
        gap: 15px;
    }

    .input-group {
        width: 100%;
    }

    button {
        width: 100%;
    }

    .tab-button {
        padding: 8px 15px;
        font-size: 14px;
    }

    .total-display {
        font-size: 2em;
    }
}
