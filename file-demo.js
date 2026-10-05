(function () {
    function byId(id) { return document.getElementById(id); }
    function pad(value) { return ("000" + value).slice(-3); }

    window.setFileDemoStatus = function (message) {
        var status = byId("index-search-status");
        if (status) status.textContent = message;
    };

    window.getIndexedFileTagForKey = function (key) {
        var records = window.currentAlg ? currentAlg.fileRecords : [];
        for (var i = 0; i < records.length; i++) {
            if (Number(records[i].key) === Number(key)) return records[i].fileTag;
        }
        return null;
    };

    window.renderIndexedFiles = function (records, selectedKey) {
        var body = byId("record-file-body");
        if (!body) return;
        body.textContent = "";
        byId("file-record-count").textContent = records.length;
        records.forEach(function (file) {
            var row = document.createElement("tr");
            if (selectedKey !== undefined && Number(selectedKey) === Number(file.key)) row.className = "file-row-selected";
            [file.key, file.fileName, file.fileTag].forEach(function (value) {
                var cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
            var action = document.createElement("td");
            var remove = document.createElement("button");
            remove.type = "button";
            remove.className = "file-row-delete";
            remove.textContent = "Remove";
            remove.setAttribute("aria-label", "Remove file key " + file.key);
            remove.addEventListener("click", function () {
                currentAlg.deleteField.value = String(file.key);
                currentAlg.deleteCallback();
            });
            action.appendChild(remove);
            row.appendChild(action);
            body.appendChild(row);
        });
        if (records.length === 0) {
            var empty = document.createElement("tr");
            var cell = document.createElement("td");
            cell.colSpan = 4;
            cell.className = "file-empty-cell";
            cell.textContent = "No files in the index.";
            empty.appendChild(cell);
            body.appendChild(empty);
        }
    };

    window.showFileSearchResult = function (key, file) {
        var result = byId("file-search-result");
        if (file) {
            window.setFileDemoStatus("Search complete · found key " + key + " in the leaf page.");
            result.textContent = "FOUND  ·  key " + key + " → " + file.fileName + "  ·  file reference " + file.fileTag;
            result.classList.add("has-result");
            window.renderIndexedFiles(currentAlg.fileRecords, key);
        } else {
            window.setFileDemoStatus("Search complete · key " + key + " is not in the file index.");
            result.textContent = "NOT FOUND  ·  no file entry has key " + key + ".";
            result.classList.remove("has-result");
            window.renderIndexedFiles(currentAlg.fileRecords);
        }
    };

    window.pendingIndexedFile = null;
    window.addEventListener("DOMContentLoaded", function () {
        byId("file-search-form").addEventListener("submit", function (event) {
            event.preventDefault();
            var key = Number(byId("file-search-key").value);
            if (!Number.isInteger(key) || key < 1 || key > 9999) {
                window.setFileDemoStatus("Enter a whole-number key from 1 to 9999.");
                return;
            }
            var result = byId("file-search-result");
            result.textContent = "Searching the root, following child pointers, then checking the leaf…";
            result.classList.remove("has-result");
            currentAlg.findField.value = String(key);
            currentAlg.findCallback();
        });
        byId("file-insert-form").addEventListener("submit", function (event) {
            event.preventDefault();
            var key = Number(byId("file-insert-key").value);
            var fileName = byId("file-insert-name").value.trim();
            if (!Number.isInteger(key) || key < 1 || key > 9999 || !fileName) {
                window.setFileDemoStatus("Enter a key from 1 to 9999 and a file name.");
                return;
            }
            if (currentAlg.containsKey(String(key))) {
                window.setFileDemoStatus("Key " + key + " already exists. Choose a different key.");
                return;
            }
            window.pendingIndexedFile = { key: key, fileName: fileName, fileTag: "F" + pad(key) };
            currentAlg.insertField.value = String(key);
            currentAlg.insertCallback();
            byId("file-insert-key").value = "";
            byId("file-insert-name").value = "";
        });
    });
}());
