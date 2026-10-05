// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

var FIRST_PRINT_POS_X = 50;
var PRINT_VERTICAL_GAP = 20;
var PRINT_MAX = 1380;
var PRINT_HORIZONTAL_GAP = 50;

var MIN_MAX_DEGREE = 3;
var MAX_MAX_DEGREE = 7;

var HEIGHT_DELTA = 104;
var NODE_SPACING = 22;
var STARTING_Y = 72;
var WIDTH_PER_ELEM = 56;
var NODE_HEIGHT = 46;

var MESSAGE_X = 5;
var MESSAGE_Y = 10;

var LINK_COLOR = "#35B9D2";
var HIGHLIGHT_CIRCLE_COLOR = "#F0A65A";
var FOREGROUND_COLOR = "#55798D";
var BACKGROUND_COLOR = "#192B38";
var LEAF_NODE_FILL = "#E2EDF2";
var LEAF_NODE_EDGE = "#496C80";
var INDEX_NODE_FILL = "#1C394F";
var INDEX_NODE_EDGE = "#9ACDE4";
var PRINT_COLOR = "#B8CFDB";


function BPlusTree(am, w, h) {
    this.init(am, w, h);

}

BPlusTree.prototype = new Algorithm();
BPlusTree.prototype.varructor = BPlusTree;
BPlusTree.superclass = Algorithm.prototype;


BPlusTree.prototype.init = function (am, w, h) {
    BPlusTree.superclass.init.call(this, am, w, h);
    this.nextIndex = 0;

    this.preemptiveSplit = false

    this.starting_x = w / 2;
    this.fileRecords = [];

    this.addControls();


    this.max_keys = 2;
    this.min_keys = 1;
    this.split_index = 1;

    this.max_degree = 3;


    this.messageID = this.nextIndex++;
    this.cmd("CreateLabel", this.messageID, "", MESSAGE_X, MESSAGE_Y, 0);
    this.cmd("SetForegroundColor", this.messageID, "#B8CFDB");
    this.moveLabel1ID = this.nextIndex++;
    this.moveLabel2ID = this.nextIndex++;

    animationManager.StartNewAnimation(this.commands);
    animationManager.skipForward();
    animationManager.clearHistory();
    this.commands = new Array();

    this.first_print_pos_y = h - 3 * PRINT_VERTICAL_GAP;


    this.xPosOfNextLabel = 100;
    this.yPosOfNextLabel = 200;
}

BPlusTree.prototype.addControls = function () {
    this.controls = [];

    this.insertField = addControlToAlgorithmBar("Text", "");
    this.insertField.placeholder = "Insert key";
    this.insertField.setAttribute("aria-label", "Key to insert");
    this.insertField.onkeydown = this.returnSubmit(this.insertField, this.insertCallback.bind(this), 4);
    this.insertField.parentNode.classList.add("btree-hidden-control");
    this.controls.push(this.insertField);

    this.insertButton = addControlToAlgorithmBar("Button", "Insert");
    this.insertButton.onclick = this.insertCallback.bind(this);
    this.insertButton.parentNode.classList.add("btree-hidden-control");
    this.controls.push(this.insertButton);

    this.deleteField = addControlToAlgorithmBar("Text", "");
    this.deleteField.placeholder = "Delete key";
    this.deleteField.setAttribute("aria-label", "Key to delete");
    this.deleteField.onkeydown = this.returnSubmit(this.deleteField, this.deleteCallback.bind(this), 4);
    this.deleteField.parentNode.classList.add("btree-hidden-control");
    this.controls.push(this.deleteField);

    this.deleteButton = addControlToAlgorithmBar("Button", "Delete");
    this.deleteButton.onclick = this.deleteCallback.bind(this);
    this.deleteButton.parentNode.classList.add("btree-hidden-control");
    this.controls.push(this.deleteButton);

    this.findField = addControlToAlgorithmBar("Text", "");
    this.findField.placeholder = "Search key";
    this.findField.setAttribute("aria-label", "Key to find");
    this.findField.onkeydown = this.returnSubmit(this.findField, this.findCallback.bind(this), 4);
    this.findField.parentNode.classList.add("btree-hidden-control");
    this.controls.push(this.findField);

    this.findButton = addControlToAlgorithmBar("Button", "Find");
    this.findButton.onclick = this.findCallback.bind(this);
    this.findButton.parentNode.classList.add("btree-hidden-control");
    this.controls.push(this.findButton);

    this.printButton = addControlToAlgorithmBar("Button", "Print");
    this.printButton.onclick = this.printCallback.bind(this);
    this.controls.push(this.printButton);

    var i;
    radioButtonNames = [];
    for (i = MIN_MAX_DEGREE; i <= MAX_MAX_DEGREE; i++) {
        radioButtonNames.push("Max. Degree = " + String(i));
    }

    this.maxDegreeRadioButtons = addRadioButtonGroupToAlgorithmBar(radioButtonNames, "MaxDegree");

    this.maxDegreeRadioButtons[0].checked = true;
    for (i = 0; i < this.maxDegreeRadioButtons.length; i++) {
        this.maxDegreeRadioButtons[i].onclick = this.maxDegreeChangedHandler.bind(this, i + MIN_MAX_DEGREE);
    }


//	this.premptiveSplitBox = addCheckboxToAlgorithmBar("Preemtive Split / Merge (Even max degree only)");
//	this.premptiveSplitBox.onclick = this.premtiveSplitCallback.bind(this);


    // Other buttons ...

}


BPlusTree.prototype.reset = function () {
    this.nextIndex = 3;
    this.max_degree = 3;
    this.max_keys = 2;
    this.min_keys = 1;
    this.split_index = 1;
    // NOTE: The order of these last two this.commands matters!
    this.treeRoot = null;
    this.ignoreInputs = true;
    // maxDegreeButtonArray[this.max_degree].selected = true;
    this.ignoreInputs = false;
}


BPlusTree.prototype.enableUI = function (event) {
    var i;
    for (i = 0; i < this.controls.length; i++) {
        this.controls[i].disabled = false;
    }
    for (i = 0; i < this.maxDegreeRadioButtons.length; i++) {
        this.maxDegreeRadioButtons[i].disabled = false;
    }
}

BPlusTree.prototype.disableUI = function (event) {
    for (var i = 0; i < this.controls.length; i++) {
        this.controls[i].disabled = true;
    }

    for (i = 0; i < this.maxDegreeRadioButtons.length; i++) {
        this.maxDegreeRadioButtons[i].disabled = true;
    }

}


//TODO:  Fix me!
BPlusTree.prototype.maxDegreeChangedHandler = function (newMaxDegree, event) {
    if (this.max_degree != newMaxDegree) {
        this.implementAction(this.changeDegree.bind(this), newMaxDegree);
    }
}


BPlusTree.prototype.insertCallback = function (event) {
    var insertedValue;
    insertedValue = this.normalizeNumber(this.insertField.value, 4);
    if (insertedValue != "") {
        this.insertField.value = "";
        if (this.containsKey(insertedValue)) {
            if (window.setFileDemoStatus) window.setFileDemoStatus("Key " + insertedValue + " already exists in the file index.");
            return;
        }
        var pendingFile = window.pendingIndexedFile && Number(window.pendingIndexedFile.key) === Number(insertedValue)
            ? window.pendingIndexedFile : { key: Number(insertedValue), fileName: "file_" + insertedValue + ".dat", fileTag: "F" + ("000" + insertedValue).slice(-3) };
        this.implementAction(this.insertElement.bind(this), insertedValue);
        this.fileRecords.push(pendingFile);
        this.fileRecords.sort(function (a, b) { return a.key - b.key; });
        window.pendingIndexedFile = null;
        if (window.renderIndexedFiles) window.renderIndexedFiles(this.fileRecords);
        if (window.setFileDemoStatus) window.setFileDemoStatus("Inserted " + pendingFile.fileName + " (key " + insertedValue + ") into the B+ tree.");
    }
}

BPlusTree.prototype.deleteCallback = function (event) {
    var deletedValue = this.deleteField.value;
    if (deletedValue != "") {
        deletedValue = this.normalizeNumber(this.deleteField.value, 4);
        this.deleteField.value = "";
        if (!this.containsKey(deletedValue)) {
            if (window.setFileDemoStatus) window.setFileDemoStatus("No file with key " + deletedValue + " is indexed.");
            return;
        }
        this.implementAction(this.deleteElement.bind(this), deletedValue);
        this.fileRecords = this.fileRecords.filter(function (file) { return Number(file.key) !== Number(deletedValue); });
        if (window.renderIndexedFiles) window.renderIndexedFiles(this.fileRecords);
        if (window.setFileDemoStatus) window.setFileDemoStatus("Removed file key " + deletedValue + " from the index.");
    }
}

BPlusTree.prototype.clearCallback = function (event) {
    this.implementAction(this.clearTree.bind(this), "");
    this.fileRecords = [];
    if (window.renderIndexedFiles) window.renderIndexedFiles(this.fileRecords);
}

BPlusTree.prototype.loadSampleFiles = function (files) {
    this.fileRecords = files.slice().sort(function (a, b) { return a.key - b.key; });
    var loadCommands = [];
    for (var i = 0; i < this.fileRecords.length; i++) {
        loadCommands = loadCommands.concat(this.insertElement(String(this.fileRecords[i].key)));
    }
    this.commands = loadCommands;
    this.animationManager.StartNewAnimation(loadCommands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
    this.commands = [];
    if (window.renderIndexedFiles) window.renderIndexedFiles(this.fileRecords);
}

BPlusTree.prototype.containsKey = function (value) {
    var node = this.treeRoot;
    while (node != null && !node.isLeaf) {
        var child = 0;
        while (child < node.numKeys && node.keys[child] < value) child++;
        if (child < node.numKeys && node.keys[child] == value) child++;
        node = node.children[child];
    }
    if (node == null) return false;
    for (var i = 0; i < node.numKeys; i++) {
        if (node.keys[i] == value) return true;
    }
    return false;
}


BPlusTree.prototype.premtiveSplitCallback = function (event) {
//	if (this.preemptiveSplit != this.premptiveSplitBox.checked)
//	{
//		this.implementAction(this.changePreemtiveSplit.bind(this), this.premptiveSplitBox.checked);
//	}
}


BPlusTree.prototype.changePreemtiveSplit = function (newValue) {
//	this.commands = new Array();
//	this.cmd("Step");
//	this.preemptiveSplit = newValue;
//	if (this.premptiveSplitBox.checked != this.preemptiveSplit)
//	{
//		this.premptiveSplitBox.checked = this.preemptiveSplit;
//	}
//	return this.commands;			
}


BPlusTree.prototype.printCallback = function (event) {
    this.implementAction(this.printTree.bind(this), "");
}


BPlusTree.prototype.printTree = function (unused) {

    this.commands = new Array();
    this.cmd("SetText", this.messageID, "Printing tree");
    var firstLabel = this.nextIndex;

    if (this.treeRoot != null) {
        this.xPosOfNextLabel = FIRST_PRINT_POS_X;
        this.yPosOfNextLabel = this.first_print_pos_y;

        var tmp = this.treeRoot;

        this.cmd("SetHighlight", tmp.graphicID, 1);
        this.cmd("Step");
        while (!tmp.isLeaf) {
            this.cmd("SetEdgeHighlight", tmp.graphicID, tmp.children[0].graphicID, 1);
            this.cmd("Step");
            this.cmd("SetHighlight", tmp.graphicID, 0);
            this.cmd("SetHighlight", tmp.children[0].graphicID, 1);
            this.cmd("SetEdgeHighlight", tmp.graphicID, tmp.children[0].graphicID, 0);
            this.cmd("Step");
            tmp = tmp.children[0];
        }

        while (tmp != null) {
            this.cmd("SetHighlight", tmp.graphicID, 1);
            for (i = 0; i < tmp.numKeys; i++) {
                var nextLabelID = this.nextIndex++;
                this.cmd("CreateLabel", nextLabelID, tmp.keys[i], this.getLabelX(tmp, i), tmp.y);
                this.cmd("SetForegroundColor", nextLabelID, PRINT_COLOR);
                this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
                this.cmd("Step");
                this.xPosOfNextLabel += PRINT_HORIZONTAL_GAP;
                if (this.xPosOfNextLabel > PRINT_MAX) {
                    this.xPosOfNextLabel = FIRST_PRINT_POS_X;
                    this.yPosOfNextLabel += PRINT_VERTICAL_GAP;
                }
            }
            if (tmp.next != null) {
                this.cmd("SetEdgeHighlight", tmp.graphicID, tmp.next.graphicID, 1);
                this.cmd("Step");
                this.cmd("SetEdgeHighlight", tmp.graphicID, tmp.next.graphicID, 0);
            }
            this.cmd("SetHighlight", tmp.graphicID, 0);
            tmp = tmp.next;
        }
        this.cmd("Step");
        for (var i = firstLabel; i < this.nextIndex; i++) {
            this.cmd("Delete", i);
        }
        this.nextIndex = firstLabel;
    }
    this.cmd("SetText", this.messageID, "");
    return this.commands;
}


BPlusTree.prototype.clearTree = function (ignored) {
    this.commands = new Array();
    this.deleteTree(this.treeRoot);
    this.treeRoot = null;
    this.nextIndex = 3;
    return this.commands;
}

BPlusTree.prototype.deleteTree = function (tree) {
    if (tree != null) {
        if (!tree.isLeaf) {
            for (var i = 0; i <= tree.numKeys; i++) {
                this.cmd("Disconnect", tree.graphicID, tree.children[i].graphicID);
                this.deleteTree(tree.children[i]);
                tree.children[i] == null;
            }
        }
        this.cmd("Delete", tree.graphicID);
    }
}


BPlusTree.prototype.changeDegree = function (degree) {
    this.commands = new Array();
    var savedRows = this.fileRecords.slice();
    this.deleteTree(this.treeRoot);
    this.treeRoot = null;
    this.nextIndex = 3;
    var newDegree = degree;
    this.ignoreInputs = true;
    //TODO:  Check me!
    this.maxDegreeRadioButtons[newDegree - MIN_MAX_DEGREE].checked = true;

    this.ignoreInputs = false;
    this.max_degree = newDegree;
    this.max_keys = newDegree - 1;
    this.min_keys = Math.floor((newDegree + 1) / 2) - 1;
    this.split_index = Math.floor((newDegree) / 2);
    if (this.commands.length == 0) {
        this.cmd("Step");
    }
    if (newDegree % 2 != 0 && this.preemptiveSplit) {
        this.preemptiveSplit = false;
        this.premptiveSplitBox.checked = false;
    }
    var rebuildCommands = this.commands.slice();
    for (var rowIndex = 0; rowIndex < savedRows.length; rowIndex++) {
        rebuildCommands = rebuildCommands.concat(this.insertElement(String(savedRows[rowIndex].key)));
    }
    this.commands = rebuildCommands;
    return this.commands;
}


BPlusTree.prototype.findCallback = function (event) {
    var findValue;
    findValue = this.normalizeNumber(this.findField.value, 4);
    this.findField.value = "";
    var file = null;
    for (var i = 0; i < this.fileRecords.length; i++) {
        if (Number(this.fileRecords[i].key) === Number(findValue)) { file = this.fileRecords[i]; break; }
    }
    this.implementActionWithCallback(this.findElement.bind(this), findValue, function () {
        if (window.showFileSearchResult) window.showFileSearchResult(findValue, file);
    });
}

BPlusTree.prototype.findElement = function (findValue) {
    this.commands = new Array();

    this.cmd("SetText", this.messageID, "Finding " + findValue);
    this.findInTree(this.treeRoot, findValue);

    return this.commands;
}


BPlusTree.prototype.findInTree = function (tree, val) {
    if (tree != null) {
        this.cmd("SetHighlight", tree.graphicID, 1);
        this.cmd("Step");
        var i;
        for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++) ;
        if (i == tree.numKeys) {
            if (!tree.isLeaf) {
                this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 1);
                this.cmd("Step");
                this.cmd("SetHighlight", tree.graphicID, 0);
                this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 0);
                this.findInTree(tree.children[tree.numKeys], val);
            }
            else {
                this.cmd("SetHighlight", tree.graphicID, 0);
                this.cmd("SetText", this.messageID, "Element " + val + " is not in the tree");
            }
        }
        else if (tree.keys[i] > val) {
            if (!tree.isLeaf) {
                this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 1);
                this.cmd("Step");
                this.cmd("SetHighlight", tree.graphicID, 0);
                this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 0);
                this.findInTree(tree.children[i], val);
            }
            else {
                this.cmd("SetHighlight", tree.graphicID, 0);
                this.cmd("SetText", this.messageID, "Element " + val + " is not in the tree");
            }
        }
        else {
            if (tree.isLeaf) {
                this.cmd("SetTextColor", tree.graphicID, "#FF0000", i);
                this.cmd("SetText", this.messageID, "Element " + val + " found");
                this.cmd("Step");
                this.cmd("SetTextColor", tree.graphicID, FOREGROUND_COLOR, i);
                this.cmd("SetHighlight", tree.graphicID, 0);

                this.cmd("Step");
            }
            else {
                this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i + 1].graphicID, 1);
                this.cmd("Step");
                this.cmd("SetHighlight", tree.graphicID, 0);
                this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i + 1].graphicID, 0);
                this.findInTree(tree.children[i + 1], val);
            }
        }
    }
    else {
        this.cmd("SetText", this.messageID, "Element " + val + " is not in the tree");
    }
}


BPlusTree.prototype.insertElement = function (insertedValue) {
    this.commands = new Array();
    insertedValue = Number(insertedValue);

    this.cmd("SetText", this.messageID, "Inserting " + insertedValue);
    this.cmd("Step");

    if (this.treeRoot == null) {
        this.treeRoot = new BTreeNode(this.nextIndex++, this.starting_x, STARTING_Y);
        this.cmd("CreateBTreeNode", this.treeRoot.graphicID, WIDTH_PER_ELEM, NODE_HEIGHT, 1, this.starting_x, STARTING_Y, LEAF_NODE_FILL, LEAF_NODE_EDGE, 1);
        this.treeRoot.keys[0] = insertedValue;
        this.cmd("SetText", this.treeRoot.graphicID, insertedValue, 0);
    }
    else {
        this.insert(this.treeRoot, insertedValue);
        if (!this.treeRoot.isLeaf) {
            this.resizeTree();
        }
    }

    this.cmd("SetText", this.messageID, "");

    return this.commands;

}


BPlusTree.prototype.insert = function (tree, insertValue) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    this.cmd("Step");
    if (tree.isLeaf) {
        this.cmd("SetText", this.messageID, "Inserting " + insertValue + ".  Inserting into a leaf");
        tree.numKeys++;
        this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
        var insertIndex = tree.numKeys - 1;
        while (insertIndex > 0 && tree.keys[insertIndex - 1] > insertValue) {
            tree.keys[insertIndex] = tree.keys[insertIndex - 1];
            this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
            insertIndex--;
        }
        tree.keys[insertIndex] = insertValue;
        this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
        this.cmd("SetHighlight", tree.graphicID, 0);
        if (tree.next != null) {
            this.cmd("Disconnect", tree.graphicID, tree.next.graphicID);
            this.cmd("Connect", tree.graphicID,
                tree.next.graphicID,
                FOREGROUND_COLOR,
                0, // Curve
                1, // Directed
                "", // Label
                tree.numKeys);


        }
        this.resizeTree();
        this.insertRepair(tree);
    }
    else {
        var findIndex = 0;
        while (findIndex < tree.numKeys && tree.keys[findIndex] < insertValue) {
            findIndex++;
        }
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[findIndex].graphicID, 1);
        this.cmd("Step");
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[findIndex].graphicID, 0);
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.insert(tree.children[findIndex], insertValue);
    }
}

BPlusTree.prototype.insertRepair = function (tree) {
    if (tree.numKeys <= this.max_keys) {
        return;
    }
    else if (tree.parent == null) {
        this.treeRoot = this.split(tree);
        return;
    }
    else {
        var newNode = this.split(tree);
        this.insertRepair(newNode);
    }
}

BPlusTree.prototype.split = function (tree) {
    this.cmd("SetText", this.messageID, "Node now contains too many keys.  Splittig ...");
    this.cmd("SetHighlight", tree.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    var rightNode = new BTreeNode(this.nextIndex++, tree.x + 100, tree.y);

    var risingNode = tree.keys[this.split_index];

    var i;
    var parentIndex
    if (tree.parent != null) {
        var currentParent = tree.parent;
        for (parentIndex = 0; parentIndex < currentParent.numKeys + 1 && currentParent.children[parentIndex] != tree; parentIndex++) ;
        if (parentIndex == currentParent.numKeys + 1) {
            throw new Error("Couldn't find which child we were!");
        }
        this.cmd("SetNumElements", currentParent.graphicID, currentParent.numKeys + 1);
        for (i = currentParent.numKeys; i > parentIndex; i--) {
            currentParent.children[i + 1] = currentParent.children[i];
            this.cmd("Disconnect", currentParent.graphicID, currentParent.children[i].graphicID);
            this.cmd("Connect", currentParent.graphicID, currentParent.children[i].graphicID, FOREGROUND_COLOR,
                0, // Curve
                0, // Directed
                "", // Label
                i + 1);

            currentParent.keys[i] = currentParent.keys[i - 1];
            this.cmd("SetText", currentParent.graphicID, currentParent.keys[i], i);
        }
        currentParent.numKeys++;
        currentParent.keys[parentIndex] = risingNode;
        this.cmd("SetText", currentParent.graphicID, "", parentIndex);
        this.cmd("CreateLabel", this.moveLabel1ID, risingNode, this.getLabelX(tree, this.split_index), tree.y)
        this.cmd("Move", this.moveLabel1ID, this.getLabelX(currentParent, parentIndex), currentParent.y)


        currentParent.children[parentIndex + 1] = rightNode;
        rightNode.parent = currentParent;

    }

    var rightSplit;

    if (tree.isLeaf) {
        rightSplit = this.split_index;
        rightNode.next = tree.next;
        tree.next = rightNode;
    }
    else {
        rightSplit = this.split_index + 1;
    }

    rightNode.numKeys = tree.numKeys - rightSplit;

    rightNode.isLeaf = tree.isLeaf;
    this.cmd("CreateBTreeNode", rightNode.graphicID, WIDTH_PER_ELEM, NODE_HEIGHT, tree.numKeys - rightSplit, tree.x, tree.y,
        rightNode.isLeaf ? LEAF_NODE_FILL : INDEX_NODE_FILL,
        rightNode.isLeaf ? LEAF_NODE_EDGE : INDEX_NODE_EDGE,
        rightNode.isLeaf ? 1 : 0);

    if (tree.isLeaf) {
        if (rightNode.next != null) {

            this.cmd("Disconnect", tree.graphicID, rightNode.next.graphicID);
            this.cmd("Connect", rightNode.graphicID,
                rightNode.next.graphicID,
                FOREGROUND_COLOR,
                0, // Curve
                1, // Directed
                "", // Label
                rightNode.numKeys);


        }
        this.cmd("Connect", tree.graphicID,
            rightNode.graphicID,
            FOREGROUND_COLOR,
            0, // Curve
            1, // Directed
            "", // Label
            this.split_index);
    }


    for (var i = rightSplit; i < tree.numKeys + 1; i++) {
        rightNode.children[i - rightSplit] = tree.children[i];
        if (tree.children[i] != null) {
            rightNode.isLeaf = false;
            this.cmd("Disconnect", tree.graphicID, tree.children[i].graphicID);

            this.cmd("Connect", rightNode.graphicID,
                rightNode.children[i - rightSplit].graphicID,
                FOREGROUND_COLOR,
                0, // Curve
                0, // Directed
                "", // Label
                i - rightSplit);
            if (tree.children[i] != null) {
                tree.children[i].parent = rightNode;
            }
            tree.children[i] = null;

        }
    }
    for (i = rightSplit; i < tree.numKeys; i++) {
        rightNode.keys[i - rightSplit] = tree.keys[i];
        this.cmd("SetText", rightNode.graphicID, rightNode.keys[i - rightSplit], i - rightSplit);
    }
    var leftNode = tree;
    leftNode.numKeys = this.split_index;
    // TO MAKE UNDO WORK -- CAN REMOVE LATER VV
    for (i = this.split_index; i < tree.numKeys; i++) {
        this.cmd("SetText", tree.graphicID, "", i);
    }
    // TO MAKE UNDO WORK -- CAN REMOVE LATER ^^
    this.cmd("SetNumElements", tree.graphicID, this.split_index);

    if (tree.parent != null) {
        this.cmd("Connect", currentParent.graphicID, rightNode.graphicID, FOREGROUND_COLOR,
            0, // Curve
            0, // Directed
            "", // Label
            parentIndex + 1);
        this.resizeTree();
        this.cmd("Step")
        this.cmd("Delete", this.moveLabel1ID);
        this.cmd("SetText", currentParent.graphicID, risingNode, parentIndex);
        return tree.parent;
    }
    else //			if (tree.parent == null)
    {
        this.treeRoot = new BTreeNode(this.nextIndex++, this.starting_x, STARTING_Y);
        this.treeRoot.isLeaf = false;
        this.cmd("CreateBTreeNode", this.treeRoot.graphicID, WIDTH_PER_ELEM, NODE_HEIGHT, 1, this.starting_x, STARTING_Y, INDEX_NODE_FILL, INDEX_NODE_EDGE, 0);
        this.treeRoot.keys[0] = risingNode;
        this.cmd("SetText", this.treeRoot.graphicID, risingNode, 0);
        this.treeRoot.children[0] = leftNode;
        this.treeRoot.children[1] = rightNode;
        leftNode.parent = this.treeRoot;
        rightNode.parent = this.treeRoot;
        this.cmd("Connect", this.treeRoot.graphicID, leftNode.graphicID, FOREGROUND_COLOR,
            0, // Curve
            0, // Directed
            "", // Label
            0);	// Connection Point
        this.cmd("Connect", this.treeRoot.graphicID, rightNode.graphicID, FOREGROUND_COLOR,
            0, // Curve
            0, // Directed
            "", // Label
            1); // Connection Point
        this.treeRoot.isLeaf = false;
        return this.treeRoot;
    }


}

BPlusTree.prototype.deleteElement = function (deletedValue) {
    this.commands = new Array();
    this.cmd("SetText", 0, "Deleting " + deletedValue);
    this.cmd("Step");
    this.cmd("SetText", 0, "");
    this.cmd("SetText", 0, "");
    this.doDelete(this.treeRoot, deletedValue);
    if (this.treeRoot != null && this.treeRoot.numKeys == 0) {
        var oldRoot = this.treeRoot;
        this.cmd("Delete", oldRoot.graphicID);
        if (oldRoot.isLeaf) {
            this.treeRoot = null;
        } else {
            this.treeRoot = oldRoot.children[0];
            this.treeRoot.parent = null;
            this.resizeTree();
        }
    }
    return this.commands;
}


BPlusTree.prototype.doDelete = function (tree, val) {
    if (tree != null) {
        this.cmd("SetHighlight", tree.graphicID, 1);
        this.cmd("Step");
        var i;
        for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++) ;
        if (i == tree.numKeys) {
            if (!tree.isLeaf) {
                this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 1);
                this.cmd("Step");
                this.cmd("SetHighlight", tree.graphicID, 0);
                this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 0);
                this.doDelete(tree.children[tree.numKeys], val);
            }
            else {
                this.cmd("SetHighlight", tree.graphicID, 0);
            }
        }
        else if (!tree.isLeaf && tree.keys[i] == val) {
            this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i + 1].graphicID, 1);
            this.cmd("Step");
            this.cmd("SetHighlight", tree.graphicID, 0);
            this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i + 1].graphicID, 0);
            this.doDelete(tree.children[i + 1], val);
        }
        else if (!tree.isLeaf) {
            this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 1);
            this.cmd("Step");
            this.cmd("SetHighlight", tree.graphicID, 0);
            this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 0);
            this.doDelete(tree.children[i], val);
        }
        else if (tree.isLeaf && tree.keys[i] == val) {
            this.cmd("SetTextColor", tree.graphicID, 0xFF0000, i);
            this.cmd("Step");
            this.cmd("SetTextColor", tree.graphicID, FOREGROUND_COLOR, i);
            for (var j = i; j < tree.numKeys - 1; j++) {
                tree.keys[j] = tree.keys[j + 1];
                this.cmd("SetText", tree.graphicID, tree.keys[j], j);
            }
            tree.numKeys--;
            this.cmd("SetText", tree.graphicID, "", tree.numKeys);
            this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
            this.cmd("SetHighlight", tree.graphicID, 0);

            if (tree.next != null) {
                this.cmd("Disconnect", tree.graphicID, tree.next.graphicID);
                this.cmd("Connect", tree.graphicID,
                    tree.next.graphicID,
                    FOREGROUND_COLOR,
                    0, // Curve
                    1, // Directed
                    "", // Label
                    tree.numKeys);
            }

            // Bit of a hack -- if we remove the smallest element in a leaf, then find the *next* smallest element
            //  (somewhat tricky if the leaf is now empty!), go up our parent stack, and fix index keys
            if (i == 0 && tree.parent != null) {
                var nextSmallest = "";
                var parentNode = tree.parent;
                var parentIndex;
                for (parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++) ;
                if (tree.numKeys == 0) {
                    if (parentIndex == parentNode.numKeys) {
                        nextSmallest == "";
                    }
                    else {
                        nextSmallest = parentNode.children[parentIndex + 1].keys[0];
                    }
                }
                else {
                    nextSmallest = tree.keys[0];
                }
                while (parentNode != null) {
                    if (parentIndex > 0 && parentNode.keys[parentIndex - 1] == val) {
                        parentNode.keys[parentIndex - 1] = nextSmallest;
                        this.cmd("SetText", parentNode.graphicID, parentNode.keys[parentIndex - 1], parentIndex - 1);
                    }
                    var grandParent = parentNode.parent;
                    for (parentIndex = 0; grandParent != null && grandParent.children[parentIndex] != parentNode; parentIndex++) ;
                    parentNode = grandParent;

                }

            }
            this.repairAfterDelete(tree);

        }
        else {
            this.cmd("SetHighlight", tree.graphicID, 0);
        }

    }
}


BPlusTree.prototype.mergeRight = function (tree) {
    this.cmd("SetText", this.messageID, "Merging node");

    var parentNode = tree.parent;
    var parentIndex = 0;
    for (parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++) ;
    var rightSib = parentNode.children[parentIndex + 1];
    this.cmd("SetHighlight", tree.graphicID, 1);
    this.cmd("SetHighlight", parentNode.graphicID, 1);
    this.cmd("SetHighlight", rightSib.graphicID, 1);

    this.cmd("Step");
    if (tree.isLeaf) {
        this.cmd("SetNumElements", tree.graphicID, tree.numKeys + rightSib.numKeys);
    }
    else {
        this.cmd("SetNumElements", tree.graphicID, tree.numKeys + rightSib.numKeys + 1);
        this.cmd("SetText", tree.graphicID, "", tree.numKeys);
        this.cmd("CreateLabel", this.moveLabel1ID, parentNode.keys[parentIndex], this.getLabelX(parentNode, parentIndex), parentNode.y);
        tree.keys[tree.numKeys] = parentNode.keys[parentIndex];
    }
    tree.x = (tree.x + rightSib.x) / 2
    this.cmd("SetPosition", tree.graphicID, tree.x, tree.y);


    var fromParentIndex = tree.numKeys;


    for (var i = 0; i < rightSib.numKeys; i++) {
        var insertIndex = tree.numKeys + 1 + i;
        if (tree.isLeaf) {
            insertIndex -= 1;
        }
        tree.keys[insertIndex] = rightSib.keys[i];
        this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
        this.cmd("SetText", rightSib.graphicID, "", i);
    }
    if (!tree.isLeaf) {
        for (i = 0; i <= rightSib.numKeys; i++) {
            this.cmd("Disconnect", rightSib.graphicID, rightSib.children[i].graphicID);
            tree.children[tree.numKeys + 1 + i] = rightSib.children[i];
            tree.children[tree.numKeys + 1 + i].parent = tree;
            this.cmd("Connect", tree.graphicID,
                tree.children[tree.numKeys + 1 + i].graphicID,
                FOREGROUND_COLOR,
                0, // Curve
                0, // Directed
                "", // Label
                tree.numKeys + 1 + i);
        }
        tree.numKeys = tree.numKeys + rightSib.numKeys + 1;

    }
    else {
        tree.numKeys = tree.numKeys + rightSib.numKeys;

        tree.next = rightSib.next;
        if (rightSib.next != null) {
            this.cmd("Connect", tree.graphicID,
                tree.next.graphicID,
                FOREGROUND_COLOR,
                0, // Curve
                1, // Directed
                "", // Label
                tree.numKeys);

        }
    }
    this.cmd("Disconnect", parentNode.graphicID, rightSib.graphicID);
    for (i = parentIndex + 1; i < parentNode.numKeys; i++) {
        this.cmd("Disconnect", parentNode.graphicID, parentNode.children[i + 1].graphicID);
        parentNode.children[i] = parentNode.children[i + 1];
        this.cmd("Connect", parentNode.graphicID,
            parentNode.children[i].graphicID,
            FOREGROUND_COLOR,
            0, // Curve
            0, // Directed
            "", // Label
            i);
        parentNode.keys[i - 1] = parentNode.keys[i];
        this.cmd("SetText", parentNode.graphicID, parentNode.keys[i - 1], i - 1);
    }
    this.cmd("SetText", parentNode.graphicID, "", parentNode.numKeys - 1);
    parentNode.numKeys--;
    this.cmd("SetNumElements", parentNode.graphicID, parentNode.numKeys);
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetHighlight", parentNode.graphicID, 0);
    this.cmd("SetHighlight", rightSib.graphicID, 0);

    this.cmd("Delete", rightSib.graphicID);
    if (!tree.isLeaf) {
        this.cmd("Move", this.moveLabel1ID, this.getLabelX(tree, fromParentIndex), tree.y);
        this.cmd("Step");
        this.cmd("Delete", this.moveLabel1ID);
        this.cmd("SetText", tree.graphicID, tree.keys[fromParentIndex], fromParentIndex);
    }
    // this.resizeTree();

    this.cmd("SetText", this.messageID, "");
    return tree;
}


BPlusTree.prototype.stealFromRight = function (tree, parentIndex) {
    // Steal from right sibling
    var parentNode = tree.parent;

    this.cmd("SetNumElements", tree.graphicID, tree.numKeys + 1);

    this.cmd("SetText", this.messageID, "Stealing from right sibling");

    var rightSib = parentNode.children[parentIndex + 1];
    tree.numKeys++;

    this.cmd("SetNumElements", tree.graphicID, tree.numKeys);

    if (tree.isLeaf) {
        this.cmd("Disconnect", tree.graphicID, tree.next.graphicID);
        this.cmd("Connect", tree.graphicID,
            tree.next.graphicID,
            FOREGROUND_COLOR,
            0, // Curve
            1, // Directed
            "", // Label
            tree.numKeys);
    }


    this.cmd("SetText", tree.graphicID, "", tree.numKeys - 1);
    this.cmd("SetText", parentNode.graphicID, "", parentIndex);
    this.cmd("SetText", rightSib.graphicID, "", 0);

    if (tree.isLeaf) {
        this.cmd("CreateLabel", this.moveLabel1ID, rightSib.keys[1], this.getLabelX(rightSib, 1), rightSib.y)
        this.cmd("CreateLabel", this.moveLabel2ID, rightSib.keys[0], this.getLabelX(rightSib, 0), rightSib.y)
        tree.keys[tree.numKeys - 1] = rightSib.keys[0];
        parentNode.keys[parentIndex] = rightSib.keys[1];

    }
    else {
        this.cmd("CreateLabel", this.moveLabel1ID, rightSib.keys[0], this.getLabelX(rightSib, 0), rightSib.y)
        this.cmd("CreateLabel", this.moveLabel2ID, parentNode.keys[parentIndex], this.getLabelX(parentNode, parentIndex), parentNode.y)
        tree.keys[tree.numKeys - 1] = parentNode.keys[parentIndex];
        parentNode.keys[parentIndex] = rightSib.keys[0];
    }


    this.cmd("Move", this.moveLabel1ID, this.getLabelX(parentNode, parentIndex), parentNode.y);
    this.cmd("Move", this.moveLabel2ID, this.getLabelX(tree, tree.numKeys - 1), tree.y);

    this.cmd("Step")
    this.cmd("Delete", this.moveLabel1ID);
    this.cmd("Delete", this.moveLabel2ID);


    this.cmd("SetText", tree.graphicID, tree.keys[tree.numKeys - 1], tree.numKeys - 1);
    this.cmd("SetText", parentNode.graphicID, parentNode.keys[parentIndex], parentIndex);
    if (!tree.isLeaf) {
        tree.children[tree.numKeys] = rightSib.children[0];
        tree.children[tree.numKeys].parent = tree;
        this.cmd("Disconnect", rightSib.graphicID, rightSib.children[0].graphicID);
        this.cmd("Connect", tree.graphicID,
            tree.children[tree.numKeys].graphicID,
            FOREGROUND_COLOR,
            0, // Curve
            0, // Directed
            "", // Label
            tree.numKeys);
        // TODO::CHECKME!

        for (var i = 1; i < rightSib.numKeys + 1; i++) {
            this.cmd("Disconnect", rightSib.graphicID, rightSib.children[i].graphicID);
            rightSib.children[i - 1] = rightSib.children[i];
            this.cmd("Connect", rightSib.graphicID,
                rightSib.children[i - 1].graphicID,
                FOREGROUND_COLOR,
                0, // Curve
                0, // Directed
                "", // Label
                i - 1);
        }

    }
    for (i = 1; i < rightSib.numKeys; i++) {
        rightSib.keys[i - 1] = rightSib.keys[i];
        this.cmd("SetText", rightSib.graphicID, rightSib.keys[i - 1], i - 1);
    }
    this.cmd("SetText", rightSib.graphicID, "", rightSib.numKeys - 1);
    rightSib.numKeys--;
    this.cmd("SetNumElements", rightSib.graphicID, rightSib.numKeys);
    this.resizeTree();
    this.cmd("SetText", this.messageID, "");

    if (tree.isLeaf) {

        if (rightSib.next != null) {
            this.cmd("Disconnect", rightSib.graphicID, rightSib.next.graphicID);
            this.cmd("Connect", rightSib.graphicID,
                rightSib.next.graphicID,
                FOREGROUND_COLOR,
                0, // Curve
                1, // Directed
                "", // Label
                rightSib.numKeys);
        }

    }
    return tree;

}


BPlusTree.prototype.stealFromLeft = function (tree, parentIndex) {
    var parentNode = tree.parent;
    // Steal from left sibling
    tree.numKeys++;
    this.cmd("SetNumElements", tree.graphicID, tree.numKeys);

    if (tree.isLeaf && tree.next != null) {

        this.cmd("Disconnect", tree.graphicID, tree.next.graphicID);
        this.cmd("Connect", tree.graphicID,
            tree.next.graphicID,
            FOREGROUND_COLOR,
            0, // Curve
            1, // Directed
            "", // Label
            tree.numKeys);
    }


    this.cmd("SetText", this.messageID, "Node has too few keys.  Stealing from left sibling.");

    for (i = tree.numKeys - 1; i > 0; i--) {
        tree.keys[i] = tree.keys[i - 1];
        this.cmd("SetText", tree.graphicID, tree.keys[i], i);
    }
    var leftSib = parentNode.children[parentIndex - 1];

    this.cmd("SetText", tree.graphicID, "", 0);
    this.cmd("SetText", parentNode.graphicID, "", parentIndex - 1);
    this.cmd("SetText", leftSib.graphicID, "", leftSib.numKeys - 1);


    if (tree.isLeaf) {
        this.cmd("CreateLabel", this.moveLabel1ID, leftSib.keys[leftSib.numKeys - 1], this.getLabelX(leftSib, leftSib.numKeys - 1), leftSib.y)
        this.cmd("CreateLabel", this.moveLabel2ID, leftSib.keys[leftSib.numKeys - 1], this.getLabelX(leftSib, leftSib.numKeys - 1), leftSib.y)
        tree.keys[0] = leftSib.keys[leftSib.numKeys - 1];
        parentNode.keys[parentIndex - 1] = leftSib.keys[leftSib.numKeys - 1];
    }
    else {
        this.cmd("CreateLabel", this.moveLabel1ID, leftSib.keys[leftSib.numKeys - 1], this.getLabelX(leftSib, leftSib.numKeys - 1), leftSib.y)
        this.cmd("CreateLabel", this.moveLabel2ID, parentNode.keys[parentIndex - 1], this.getLabelX(parentNode, parentIndex - 1), parentNode.y)
        tree.keys[0] = parentNode.keys[parentIndex - 1];
        parentNode.keys[parentIndex - 1] = leftSib.keys[leftSib.numKeys - 1];
    }
    this.cmd("Move", this.moveLabel1ID, this.getLabelX(parentNode, parentIndex - 1), parentNode.y);
    this.cmd("Move", this.moveLabel2ID, this.getLabelX(tree, 0), tree.y);

    this.cmd("Step")
    this.cmd("Delete", this.moveLabel1ID);
    this.cmd("Delete", this.moveLabel2ID);


    if (!tree.isLeaf) {
        for (var i = tree.numKeys; i > 0; i--) {
            this.cmd("Disconnect", tree.graphicID, tree.children[i - 1].graphicID);
            tree.children[i] = tree.children[i - 1];
            this.cmd("Connect", tree.graphicID,
                tree.children[i].graphicID,
                FOREGROUND_COLOR,
                0, // Curve
                0, // Directed
                "", // Label
                i);
        }
        tree.children[0] = leftSib.children[leftSib.numKeys];
        this.cmd("Disconnect", leftSib.graphicID, leftSib.children[leftSib.numKeys].graphicID);
        this.cmd("Connect", tree.graphicID,
            tree.children[0].graphicID,
            FOREGROUND_COLOR,
            0, // Curve
            0, // Directed
            "", // Label
            0);
        leftSib.children[leftSib.numKeys] = null;
        tree.children[0].parent = tree;

    }

    this.cmd("SetText", tree.graphicID, tree.keys[0], 0);
    this.cmd("SetText", parentNode.graphicID, parentNode.keys[parentIndex - 1], parentIndex - 1);
    this.cmd("SetText", leftSib.graphicID, "", leftSib.numKeys - 1);

    leftSib.numKeys--;
    this.cmd("SetNumElements", leftSib.graphicID, leftSib.numKeys);
    this.resizeTree();
    this.cmd("SetText", this.messageID, "");


    if (tree.isLeaf) {
        this.cmd("Disconnect", leftSib.graphicID, tree.graphicID);
        this.cmd("Connect", leftSib.graphicID,
            tree.graphicID,
            FOREGROUND_COLOR,
            0, // Curve
            1, // Directed
            "", // Label
            leftSib.numKeys);

    }


    return tree;
}


BPlusTree.prototype.repairAfterDelete = function (tree) {
    if (tree.numKeys < this.min_keys) {
        if (tree.parent == null) {
            if (tree.numKeys == 0) {
                this.cmd("Delete", tree.graphicID);
                this.treeRoot = tree.children[0] || null;
                if (this.treeRoot != null)
                    this.treeRoot.parent = null;
                this.resizeTree();
            }
        }
        else {
            var parentNode = tree.parent;
            for (var parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++) ;


            if (parentIndex > 0 && parentNode.children[parentIndex - 1].numKeys > this.min_keys) {
                this.stealFromLeft(tree, parentIndex);

            }
            else if (parentIndex < parentNode.numKeys && parentNode.children[parentIndex + 1].numKeys > this.min_keys) {
                this.stealFromRight(tree, parentIndex);

            }
            else if (parentIndex == 0) {
                // Merge with right sibling
                var nextNode = this.mergeRight(tree);
                this.repairAfterDelete(nextNode.parent);
            }
            else {
                // Merge with left sibling
                nextNode = this.mergeRight(parentNode.children[parentIndex - 1]);
                this.repairAfterDelete(nextNode.parent);

            }


        }
    }
    else if (tree.parent != null) {


    }
}


BPlusTree.prototype.getLabelX = function (tree, index) {
    return tree.x - WIDTH_PER_ELEM * tree.numKeys / 2 + WIDTH_PER_ELEM / 2 + index * WIDTH_PER_ELEM;
}

BPlusTree.prototype.resizeTree = function () {
    this.resizeWidths(this.treeRoot);
    this.setNewPositions(this.treeRoot, this.starting_x, STARTING_Y);
    this.animateNewPositions(this.treeRoot);
}

BPlusTree.prototype.setNewPositions = function (tree, xPosition, yPosition) {
    if (tree != null) {
        tree.y = yPosition;
        tree.x = xPosition;
        if (!tree.isLeaf) {
            var leftEdge = xPosition - tree.width / 2;
            var priorWidth = 0;
            for (var i = 0; i < tree.numKeys + 1; i++) {
                this.setNewPositions(tree.children[i], leftEdge + priorWidth + tree.widths[i] / 2, yPosition + HEIGHT_DELTA);
                priorWidth += tree.widths[i];
            }
        }
    }
}

BPlusTree.prototype.animateNewPositions = function (tree) {
    if (tree == null) {
        return;
    }
    var i;
    for (i = 0; i < tree.numKeys + 1; i++) {
        this.animateNewPositions(tree.children[i]);
    }
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
}

BPlusTree.prototype.resizeWidths = function (tree) {
    if (tree == null) {
        return 0;
    }
    if (tree.isLeaf) {
        for (var i = 0; i < tree.numKeys + 1; i++) {
            tree.widths[i] = 0;
        }
        tree.width = tree.numKeys * WIDTH_PER_ELEM + NODE_SPACING;
        return tree.width;
    }
    else {
        var treeWidth = 0;
        for (i = 0; i < tree.numKeys + 1; i++) {
            tree.widths[i] = this.resizeWidths(tree.children[i]);
            treeWidth = treeWidth + tree.widths[i];
        }
        treeWidth = Math.max(treeWidth, tree.numKeys * WIDTH_PER_ELEM + NODE_SPACING);
        tree.width = treeWidth;
        return treeWidth;
    }
}


function BTreeNode(id, initialX, initialY) {
    this.widths = [];
    this.keys = [];
    this.children = [];
    this.x = initialX;
    this.y = initialY;
    this.graphicID = id;
    this.numKeys = 1;
    this.isLeaf = true;
    this.parent = null;

    this.leftWidth = 0;
    this.rightWidth = 0;
    // Could use children for next pointer, but I got lazy ...
    this.next = null;


}


var currentAlg;

function init() {
    var animManag = initCanvas();
    currentAlg = new BPlusTree(animManag, canvas.width, canvas.height);
    var sampleFiles = [];
    for (var key = 10; key <= 100; key += 10) {
        var tag = "F" + ("000" + key).slice(-3);
        sampleFiles.push({ key: key, fileName: "file_" + ("000" + key).slice(-3) + ".dat", fileTag: tag });
    }
    currentAlg.loadSampleFiles(sampleFiles);
}
