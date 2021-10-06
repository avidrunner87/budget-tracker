let db;

const request = indexedDB.open('budgetTracker_db');

request.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore('TransactionStore', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['TransactionStore'], 'readwrite');
    const store = transaction.objectStore('TransactionStore');
    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(['TransactionStore'], 'readwrite');
    const store = transaction.objectStore('TransactionStore');
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction(
                        ['TransactionStore'],
                        'readwrite'
                    );
                    const store = transaction.objectStore('TransactionStore');
                    store.clear();
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
